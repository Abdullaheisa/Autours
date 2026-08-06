<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\NorthcarApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;

class SyncNorthcarBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'northcar:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Northcar stations as individual branches using REQLOC.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        $startTime = microtime(true);

        $service = new NorthcarApiService();

        $this->info("Starting Northcar branch sync...");
        \Illuminate\Support\Facades\Log::info("SYNC_START: Northcar branch sync started.");

        try {
            // 1. Resolve or create the Northcar supplier user
            $supplierUser = User::firstOrCreate(
                ['email' => 'ashish@northcar.ca'],
                [
                    'name' => 'Northcar Supplier',
                    'role' => 'active_supplier',
                    'password' => Hash::make('Qrentals@12345'),
                    'company' => 'Northcar',
                ]
            );

            $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

            // 2. Fetch all locations
            $this->info('Fetching locations from Northcar API...');
            $locations = $service->getLocations();

            if (empty($locations)) {
                $this->error('No locations returned from Northcar API.');
                return self::FAILURE;
            }

            $this->info('Locations fetched: ' . count($locations));

            // Load existing station IDs to determine created vs updated
            $existingStationIds = Branch::where('company_id', $supplierUser->id)
                ->pluck('station_id')
                ->toArray();
            
            $existingMap = array_flip($existingStationIds);

            $normalizer = new BranchNormalizationService();
            $upsertData = [];
            $validStationIds = [];

            $created = 0;
            $updated = 0;
            $now = \Carbon\Carbon::now()->toDateTimeString();

            $this->info('Processing locations...');
            // Sort locations descending by length of LocationCode.
            // Northcar returns rates ONLY for the longer 'NC' suffixed codes (e.g. DXBNC instead of DXB).
            // Processing longest first ensures the rate-bearing station ID is kept in the database.
            usort($locations, function ($a, $b) {
                return strlen($b['LocationCode'] ?? '') <=> strlen($a['LocationCode'] ?? '');
            });

            $bar = $this->output->createProgressBar(count($locations));
            $bar->start();

            $seenAirports = [];

            foreach ($locations as $location) {
                $locationCode = (string) ($location['LocationCode'] ?? '');
                $name = (string) ($location['LocationName'] ?? '');
                $address = (string) ($location['Address'] ?? '');
                $currency = (string) ($location['Currency'] ?? '');
                
                $latRaw = (string) ($location['Latitude'] ?? '');
                $lat = is_numeric($latRaw) && abs((float) $latRaw) <= 90 ? $latRaw : null;
                
                $lngRaw = (string) ($location['Longitude'] ?? '');
                $lng = is_numeric($lngRaw) && abs((float) $lngRaw) <= 180 ? $lngRaw : null;

                if (empty($locationCode) || empty($name)) {
                    $bar->advance();
                    continue;
                }

                // Guess country from address first for better normalization context
                $parts = array_map('trim', explode(',', $address));
                $guessedCountryRaw = count($parts) > 1 ? end($parts) : '';
                
                // Only use the guessed country if it's a recognized, valid country name
                $isoCode = \App\Services\CountryCurrencyResolver::resolveCountryCode($guessedCountryRaw);
                $guessedCountry = $isoCode ? \App\Services\CountryCurrencyResolver::normalizeCountryName($guessedCountryRaw) : '';

                // Northcar appends "NC" (or sometimes "IR") to standard IATA codes (e.g., HERNC -> HER). 
                // We strip this suffix ONLY for the normalizer so it can successfully match the IATA code.
                $normalizedIata = preg_replace('/(NC|IR)$/i', '', $locationCode);

                // Pre-normalize data
                $normData = $normalizer->normalize(
                    $name,
                    $name, // Fallback city
                    $guessedCountry, // Use valid guessed country
                    $locationCode,
                    $normalizedIata
                );

                if (empty($normData['country'])) {
                    $normData['country'] = $guessedCountry ?: null;
                }

                $locationType = (!empty($normData['airport_id']) || stripos($name, 'airport') !== false || stripos($name, 'terminal') !== false) ? 'Airport' : 'Downtown';

                if ($locationType !== 'Airport') {
                    $bar->advance();
                    continue;
                }

                if (isset($normData['airport_id'])) {
                    if (in_array($normData['airport_id'], $seenAirports)) {
                        $bar->advance();
                        continue;
                    }
                    $seenAirports[] = $normData['airport_id'];

                    // Overwrite the API's text info with our DB's canonical info
                    $name = $normData['normalized_name'];
                    $address = $normData['normalized_name'];
                }

                $validStationIds[] = $locationCode;

                if (isset($existingMap[$locationCode])) {
                    $updated++;
                } else {
                    $created++;
                }

                $upsertData[] = array_merge([
                    'company_id' => $supplierUser->id,
                    'station_id' => $locationCode,
                    'name' => $name,
                    'location' => $name,
                    'adresse' => $address,
                    'city' => $name,
                    'currency' => \App\Services\CountryCurrencyResolver::resolveCurrency($guessedCountryRaw),
                    'lat' => $lat,
                    'lng' => $lng,
                    'location_type' => $locationType,
                    'abriviation' => $locationCode,
                    'created_at' => $now,
                    'updated_at' => $now,
                ], $normData);

                $bar->advance();
            }

            $bar->finish();
            $this->newLine(2);

            $this->info('Saving branches to the database...');
            $newBranchesData = [];
            
            // Begin a transaction for faster updates
            \Illuminate\Support\Facades\DB::transaction(function () use ($upsertData, &$newBranchesData, $existingMap) {
                foreach ($upsertData as $data) {
                    if (isset($existingMap[$data['station_id']])) {
                        // Update existing
                        Branch::where('company_id', $data['company_id'])
                            ->where('station_id', $data['station_id'])
                            ->update($data);
                    } else {
                        // Collect for bulk insert
                        $newBranchesData[] = $data;
                    }
                }

                // Bulk insert new branches
                foreach (array_chunk($newBranchesData, 500) as $chunk) {
                    Branch::insert($chunk);
                }
            });

            // Delete branches no longer returned
            $this->info('Cleaning up orphaned branches...');
            $orphanedBranches = Branch::where('company_id', $supplierUser->id)
                ->whereNotIn('station_id', $validStationIds)
                ->get();

            $deleted = 0;
            foreach ($orphanedBranches as $ob) {
                $ob->delete();
                $deleted++;
                $this->warn("Deleted orphaned branch: {$ob->name}");
            }

            $duration = round(microtime(true) - $startTime, 2);

            $this->newLine();
            $this->info('========== Northcar Branch Sync Complete ==========');
            $this->info("Duration : {$duration}s");
            $this->info("Created  : {$created}");
            $this->info("Updated  : {$updated}");
            $this->info("Deleted  : {$deleted}");
            $this->info("Total    : " . count($validStationIds));
            $this->info('===================================================');

            \Illuminate\Support\Facades\Log::info("SYNC_END: Northcar branch sync finished in {$duration}s.", [
                'created' => $created,
                'updated' => $updated,
                'deleted' => $deleted,
            ]);

            return self::SUCCESS;

        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("SYNC_ERROR: Northcar branch sync failed: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            $this->error("Error syncing Northcar branches: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
