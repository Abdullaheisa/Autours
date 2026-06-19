<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\WheelsysApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;

class SyncWheelsysBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wheelsys:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Wheelsys stations as individual branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new WheelsysApiService();

        // 1. Resolve or create the Wheelsys supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'milva.supe@autowill-rentacar.hr'],
            [
                'name' => 'Wheelsys',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Wheelsys',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Fetch all stations from Wheelsys API
        $this->info('Fetching stations from Wheelsys API...');
        $stations = $service->getStations();

        if (empty($stations)) {
            $this->error('No stations returned from Wheelsys API.');
            return self::FAILURE;
        }

        $this->info('Stations fetched: ' . count($stations));

        // 3. Create/update one branch per station
        $created = 0;
        $updated = 0;
        $validStationIds = [];

        foreach ($stations as $station) {
            $locationCode = $station['code'];
            $name = $station['name'];

            if (empty($locationCode) || empty($name)) {
                continue;
            }

            $address = $station['address'];
            $countryCode = $station['country'];
            $city = $station['city'];
            $lat = $station['lat'];
            $lng = $station['long'];

            $currency = CountryCurrencyResolver::resolveCurrency($countryCode);

            $validStationIds[] = $locationCode;

            // Simple heuristic for location type from the name or leave as 'Office'
            $stationType = stripos($name, 'AIRPORT') !== false ? 'Airport' : 'Office';

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $locationCode,
                ],
                [
                    'name' => $name,
                    'location' => $city ?: $name,
                    'adresse' => $address ?: $name,
                    'city' => $city ?: $name,
                    'country' => CountryCurrencyResolver::resolveCountryName($countryCode),
                    'currency' => $currency,
                    'lat' => $lat,
                    'lng' => $lng,
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

        // 4. Delete branches no longer returned by Wheelsys
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
        $this->info('========== Wheelsys Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Total    : " . count($stations));
        $this->info('===================================================');

        return self::SUCCESS;
    }

}
