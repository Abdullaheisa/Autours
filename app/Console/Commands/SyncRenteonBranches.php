<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\RenteonApiService;
use App\Services\BranchNormalizationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SyncRenteonBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'renteon:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Renteon locations as individual branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new RenteonApiService();

        // 1. Resolve or create the Renteon supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'arda@essencecarrental.com'],
            [
                'name' => 'Renteon (' . RenteonApiService::PROVIDER_CODE . ')',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Renteon',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Fetch all locations from Renteon API
        $this->info('Fetching locations from Renteon API...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->error('No locations returned from Renteon API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // 3. Create/update one branch per location
        $created = 0;
        $updated = 0;
        $validStationIds = [];

        foreach ($locations as $location) {
            $locationCode = $location['Code'] ?? null;
            $name = $location['Name'] ?? null;

            if (empty($locationCode) || empty($name)) {
                continue;
            }

            $countryCode = $location['CountryCode'] ?? '';
            $currency = CountryCurrencyResolver::resolveCurrency($countryCode);

            $validStationIds[] = $locationCode;

            $stationType = $location['Type'] ?? 'Office';
            if (stripos($name, 'AIRPORT') !== false) {
                $stationType = 'Airport';
            }

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $locationCode,
                ],
                [
                    'name' => $name,
                    'location' => $name,
                    'adresse' => $name,
                    'city' => $name, // Can be improved if we had city extraction
                    'country' => CountryCurrencyResolver::resolveCountryName($countryCode),
                    'currency' => $currency,
                    'lat' => null,
                    'lng' => null,
                    'location_type' => $stationType,
                    'abriviation' => $locationCode,
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

        // 4. Delete branches no longer returned by Renteon
        $orphanedBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotIn('station_id', $validStationIds)
            ->get();

        $deleted = 0;
        foreach ($orphanedBranches as $ob) {
            $ob->delete();
            $deleted++;
            $this->warn("Deleted orphaned branch: {$ob->name}");
        }

        $this->newLine();
        $this->info('========== Renteon Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Total    : " . count($locations));
        $this->info('===================================================');

        return self::SUCCESS;
    }

}
