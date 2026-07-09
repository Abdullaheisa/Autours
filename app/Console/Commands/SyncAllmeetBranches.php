<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\KolaycarApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncAllmeetBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'allmeet:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Allmeet locations as branches.';

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

        $service = new KolaycarApiService('pQX1iJ70I9eKepswD8dsAw==', '!Cu89.!Wi4691');

        // ------------------------------------------------------------------
        // 1. Resolve or create the Allmeet supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'info@allmeetrentacar.com'],
            [
                'name' => 'Allmeet',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Allmeet Rent a Car',
            ]
        );
        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all locations from Kolaycar API
        // ------------------------------------------------------------------
        $this->info('Fetching locations from Allmeet...');
        $response = $service->getLocations();

        $locations = $response['LOCATIONS'] ?? [];

        if (empty($locations)) {
            $this->error('No locations returned from Kolaycar API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;

        foreach ($locations as $location) {
            $locationId = (string) ($location['LOCATIONID'] ?? '');
            $locationName = (string) ($location['LOCATIONNAME'] ?? '');
            $city = (string) ($location['CITYNAME'] ?? '');
            $country = (string) ($location['COUNTRYNAME'] ?? '');
            
            // Vendors inside the location
            $vendors = $location['VENDORS'] ?? [];
            if (empty($vendors)) {
                continue;
            }

            // We pick the first vendor to get address and geo
            $firstVendor = $vendors[0] ?? [];
            $address = (string) ($firstVendor['VENDORLOCATIONADDRESS'] ?? $city);
            $geo = (string) ($firstVendor['VENDORLOCATIONGEO'] ?? '');

            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            if ($this->option('dry-run')) {
                $this->line("[DRY RUN] Would sync location ID {$locationId} -> '{$locationName}'");
                continue;
            }

            // Parse lat/lng from Maps_Point if format is "lat, lng"
            $lat = null;
            $lng = null;
            if (str_contains($geo, ',')) {
                $parts = array_map('trim', explode(',', $geo, 2));
                $lat = $parts[0] ?? null;
                $lng = $parts[1] ?? null;
            }

            $countryName = CountryCurrencyResolver::resolveCountryName($country ?: 'TR');
            $currency = CountryCurrencyResolver::resolveCurrency($country ?: 'TR');

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUserId,
                    'station_id' => $locationId,
                ],
                [
                    'name' => $locationName,
                    'location' => $locationName,
                    'adresse' => $address ?: $locationName,
                    'city' => $city ?: $locationName,
                    'country' => $countryName,
                    'currency' => $currency,
                    'lat' => $lat,
                    'lng' => $lng,
                    'location_type' => str_contains(strtolower($locationName), 'airport') ? 1 : 2,
                    'abriviation' => $locationId,
                ]
            );

            // Normalize branch name/location against canonical airports
            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );

            $branch->update(array_filter([
                'airport_id' => $normData['airport_id'] ?? null,
                'name' => $normData['normalized_name'] ?? null,
                'location' => $normData['location'] ?? null,
                'abriviation' => $normData['abriviation'] ?? null,
            ]));

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Created: {$created}, Updated: {$updated}.");
        }

        return self::SUCCESS;
    }
}
