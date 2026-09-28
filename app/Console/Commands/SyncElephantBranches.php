<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\ElephantApiService;
use Illuminate\Console\Command;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\CountryCurrencyResolver;
use Carbon\Carbon;

class SyncElephantBranches extends Command
{
    protected $signature = 'elephant:sync-branches';
    protected $description = 'Sync Elephant stations as individual branches using GetStations.';

    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        $startTime = microtime(true);

        $this->info("Starting Elephant branch sync...");
        Log::info("SYNC_START: Elephant branch sync started.");

        try {
            $supplierUser = User::where('email', 'info@elephantrentacar.com')->first();
            if (!$supplierUser || $supplierUser->integration_type !== 'elephant') {
                $this->error('Elephant supplier not found or integration_type not set.');
                return self::FAILURE;
            }

            $service = new ElephantApiService($supplierUser->api_key, $supplierUser->api_password);
            
            $this->info('Fetching stations from Elephant API...');
            $stations = $service->getStations();

            if (empty($stations)) {
                $this->error('No stations returned from Elephant API.');
                return self::FAILURE;
            }

            $this->info('Stations fetched: ' . count($stations));
            
            $locations = [];
            foreach ($stations as $station) {
                $code = $station['Code'] ?? '';
                if ($code) {
                    $places = $service->getPlacesForStation($code);
                    foreach ($places as $place) {
                        // Merge station country/currency data to use later
                        $place['CountryName'] = $station['CountryName'] ?? 'Cyprus';
                        $place['CityName'] = $station['CityName'] ?? '';
                        $locations[] = $place;
                    }
                }
            }

            $existingStationIds = Branch::withTrashed()
                ->where('company_id', $supplierUser->id)
                ->pluck('station_id')
                ->toArray();
            
            $existingMap = array_flip($existingStationIds);

            $normalizer = new BranchNormalizationService();
            $upsertData = [];
            $validStationIds = [];

            $created = 0;
            $updated = 0;
            $now = Carbon::now()->toDateTimeString();

            $bar = $this->output->createProgressBar(count($locations));
            $bar->start();

            $seenAirports = [];

            foreach ($locations as $location) {
                $locationCode = (string) ($location['Name'] ?? '');
                $name = (string) ($location['NameTranslated'] ?? $locationCode);
                $address = (string) ($location['Name'] ?? '');
                
                $latRaw = (string) ($location['Latitude'] ?? '');
                $lat = is_numeric($latRaw) && abs((float) $latRaw) <= 90 ? $latRaw : null;
                
                $lngRaw = (string) ($location['Longitude'] ?? '');
                $lng = is_numeric($lngRaw) && abs((float) $lngRaw) <= 180 ? $lngRaw : null;
                
                $countryRaw = (string) ($location['CountryName'] ?? '');
                $cityRaw = (string) ($location['CityName'] ?? '');

                if (empty($locationCode) || empty($name)) {
                    $bar->advance();
                    continue;
                }

                $isoCode = CountryCurrencyResolver::resolveCountryCode($countryRaw);
                $guessedCountry = $isoCode ? CountryCurrencyResolver::normalizeCountryName($countryRaw) : '';

                // Try to use IATA code if available or fallback
                $normalizedIata = $locationCode; 

                $normData = $normalizer->normalize(
                    $name,
                    $cityRaw ?: $name,
                    $guessedCountry,
                    $locationCode,
                    $normalizedIata
                );

                if (empty($normData['country'])) {
                    $normData['country'] = $guessedCountry ?: null;
                }

                $locationType = (!empty($normData['airport_id']) || stripos($name, 'airport') !== false || stripos($name, 'terminal') !== false) ? 'Airport' : 'Downtown';

                if ($locationType !== 'Airport') {
                    // Just a business rule to only take airports, per Northcar example
                    $bar->advance();
                    continue;
                }

                if (isset($normData['airport_id'])) {
                    if (in_array($normData['airport_id'], $seenAirports)) {
                        $bar->advance();
                        continue;
                    }
                    $seenAirports[] = $normData['airport_id'];

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
                    'city' => $cityRaw ?: $name,
                    'currency' => CountryCurrencyResolver::resolveCurrency($guessedCountry),
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
            
            DB::transaction(function () use ($upsertData, &$newBranchesData, $existingMap) {
                foreach ($upsertData as $data) {
                    if (isset($existingMap[$data['station_id']])) {
                        $branch = Branch::withTrashed()
                            ->where('company_id', $data['company_id'])
                            ->where('station_id', $data['station_id'])
                            ->first();
                        if ($branch) {
                            if ($branch->trashed()) {
                                $branch->restore();
                            }
                            $branch->update($data);
                        }
                    } else {
                        $newBranchesData[] = $data;
                    }
                }

                foreach (array_chunk($newBranchesData, 500) as $chunk) {
                    Branch::insert($chunk);
                }
            });

            $this->info('Cleaning up orphaned branches...');
            $orphanedBranches = Branch::where('company_id', $supplierUser->id)
                ->whereNotIn('station_id', $validStationIds)
                ->get();

            $deleted = 0;
            foreach ($orphanedBranches as $ob) {
                Vehicle::where('pickup_loc', $ob->id)->delete();
                $ob->delete();
                $deleted++;
            }

            $duration = round(microtime(true) - $startTime, 2);

            $this->newLine();
            $this->info('========== Elephant Branch Sync Complete ==========');
            $this->info("Duration : {$duration}s");
            $this->info("Created  : {$created}");
            $this->info("Updated  : {$updated}");
            $this->info("Deleted  : {$deleted}");
            $this->info("Total    : " . count($validStationIds));
            $this->info('===================================================');

            Log::info("SYNC_END: Elephant branch sync finished in {$duration}s.", [
                'created' => $created,
                'updated' => $updated,
                'deleted' => $deleted,
            ]);

            return self::SUCCESS;

        } catch (\Throwable $e) {
            Log::error("SYNC_ERROR: Elephant branch sync failed: " . $e->getMessage());
            $this->error("Error syncing Elephant branches: " . $e->getMessage());
            return self::FAILURE;
        }
    }
}
