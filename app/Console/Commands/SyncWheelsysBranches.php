<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
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

            $currency = $this->resolveCurrency($countryCode);

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
                    'country' => $this->resolveCountryName($countryCode),
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

    private function resolveCurrency(string $countryCode): string
    {
        return match (strtoupper($countryCode)) {
            'GR' => 'EUR',
            'CY' => 'EUR',
            'CZ' => 'CZK',
            'AE' => 'AED',
            'MF' => 'EUR',
            'US' => 'USD',
            'MU' => 'MUR',
            'MA' => 'MAD',
            'PL' => 'PLN',
            'PT' => 'EUR',
            'RO' => 'RON',
            'TR' => 'TRY',
            'RS' => 'RSD',
            'SK' => 'EUR',
            'GE' => 'GEL',
            'AL' => 'ALL',
            'ES' => 'EUR',
            'GB' => 'GBP',
            'MK' => 'MKD',
            'BA' => 'BAM',
            'BG' => 'BGN',
            'HR' => 'EUR',
            'XK' => 'EUR',
            'ME' => 'EUR',
            'EG' => 'EGP',
            default => 'EUR',
        };
    }

    private function resolveCountryName(string $code): string
    {
        return match (strtoupper($code)) {
            'GR' => 'Greece',
            'CY' => 'Cyprus',
            'CZ' => 'Czech Republic',
            'AE' => 'United Arab Emirates',
            'MF' => 'Sint Maarten',
            'US' => 'United States',
            'MU' => 'Mauritius',
            'MA' => 'Morocco',
            'PL' => 'Poland',
            'PT' => 'Portugal',
            'RO' => 'Romania',
            'TR' => 'Turkey',
            'RS' => 'Serbia',
            'SK' => 'Slovakia',
            'GE' => 'Georgia',
            'AL' => 'Albania',
            'ES' => 'Spain',
            'GB' => 'United Kingdom',
            'MK' => 'North Macedonia',
            'BA' => 'Bosnia and Herzegovina',
            'BG' => 'Bulgaria',
            'HR' => 'Croatia',
            'XK' => 'Kosovo',
            'ME' => 'Montenegro',
            'EG' => 'Egypt',
            default => $code,
        };
    }
}
