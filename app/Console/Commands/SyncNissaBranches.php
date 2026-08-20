<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\NissaJsonApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncNissaBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'nissa:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Nissa Car Rental locations as branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (!$this->option('dry-run') && !$this->option('real')) {
            $this->error('You must specify either --dry-run or --real.');
            return self::FAILURE;
        }

        if ($this->option('dry-run') && $this->option('real')) {
            $this->error('You cannot specify both --dry-run and --real.');
            return self::FAILURE;
        }

        // Suppress PHP 8.5 deprecations from older Guzzle versions
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new NissaJsonApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Nissa supplier user
        // ------------------------------------------------------------------
        $supplierUserId = 0;
        
        if ($this->option('dry-run')) {
            $this->info('[DRY RUN] Would resolve or create supplier user: ismail.cali@nissacarrental.com');
        } else {
            $supplierUser = User::firstOrCreate(
                ['email' => 'ismail.cali@nissacarrental.com'],
                [
                    'name' => 'Nissa Car Rental',
                    'role' => 'active_supplier',
                    'password' => Hash::make('Qrentals@12345'),
                    'company' => 'Nissa Car Rental',
                ]
            );
            $supplierUserId = $supplierUser->id;
            $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");
        }

        // ------------------------------------------------------------------
        // 2. Fetch all locations from Nissa
        // ------------------------------------------------------------------
        $this->info('Fetching locations from Nissa...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->error('No locations returned from Nissa API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;

        foreach ($locations as $location) {
            $locationId = (string) ($location['location_id'] ?? '');
            $locationName = (string) ($location['location_name'] ?? '');
            $address = (string) ($location['address'] ?? '');
            $countryCode = (string) ($location['country'] ?? '');
            $mapsPoint = (string) ($location['maps_point'] ?? '');

            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            // Parse lat/lng from Maps_Point if format is "lat, lng"
            $lat = null;
            $lng = null;
            if (str_contains($mapsPoint, ',')) {
                $parts = array_map('trim', explode(',', $mapsPoint, 2));
                $lat = $parts[0] ?? null;
                $lng = $parts[1] ?? null;
            }

            $country = CountryCurrencyResolver::resolveCountryName($countryCode);
            $currency = CountryCurrencyResolver::resolveCurrency($countryCode);

            if ($this->option('dry-run')) {
                $this->info("[DRY RUN] Would create/update branch: {$locationName} ({$locationId})");
                $created++;
            } else {
                $branch = Branch::updateOrCreate(
                    [
                        'company_id' => $supplierUserId,
                        'station_id' => $locationId,
                    ],
                    [
                        'name' => $locationName,
                        'location' => $locationName,
                        'adresse' => $address ?: $locationName,
                        'city' => $locationName,
                        'country' => $country,
                        'currency' => $currency,
                        'lat' => $lat,
                        'lng' => $lng,
                        'location_type' => $this->detectLocationType($locationName),
                        'abriviation' => $locationId,
                    ]
                );

                // Normalize branch name/location against canonical airports
                $normalizer = new BranchNormalizationService();
                $normData = $normalizer->normalize(
                    $branch->name,
                    $branch->city,
                    $branch->country,
                    $branch->station_id,
                    $branch->abriviation
                );
                $branch->update($normData);

                if ($branch->wasRecentlyCreated) {
                    $created++;
                } else {
                    $updated++;
                }
            }
        }

        // ------------------------------------------------------------------
        // 4. Delete branches no longer returned by Nissa
        // ------------------------------------------------------------------
        $activeLocationIds = array_filter(array_map(
            fn ($l) => (string) ($l['location_id'] ?? ''),
            $locations
        ));

        $deleted = 0;
        if ($this->option('dry-run')) {
            $this->info('[DRY RUN] Would check for orphaned branches and delete them.');
        } else {
            $orphanedBranches = Branch::where('company_id', $supplierUserId)
                ->whereNotIn('station_id', $activeLocationIds)
                ->get();

            foreach ($orphanedBranches as $ob) {
                $ob->delete();
                $deleted++;
                $this->warn("Deleted orphaned branch: {$ob->name}");
            }
        }

        $this->newLine();
        $this->info('========== Nissa Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Locations: " . count($locations));
        $this->info('==============================================');

        return self::SUCCESS;
    }

    /**
     * Detect location type from location name.
     */
    private function detectLocationType(string $name): string
    {
        $lower = strtolower($name);

        if (str_contains($lower, 'airport') || str_contains($lower, 'havaliman') || str_contains($lower, 'terminal')) {
            return 'Airport';
        }
        if (str_contains($lower, 'hotel') || str_contains($lower, 'otel')) {
            return 'Hotel';
        }

        return 'Downtown';
    }

}
