<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\SurpriceApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncSurpriceBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'surprice:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Surprice stations as individual branches using /v1/location/search.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new SurpriceApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Surprice supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'a.racko@surpricemobility.com'],
            [
                'name' => 'Surprice Mobility',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Surprice',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all locations from Surprice API
        // ------------------------------------------------------------------
        $this->info('Fetching locations from Surprice API...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->error('No locations returned from Surprice API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $validStationIds = [];

        foreach ($locations as $location) {
            $locationCode = (string) ($location['locationCode'] ?? '');
            $extendedCode = (string) ($location['extendedLocationCode'] ?? '');
            $name = (string) ($location['name'] ?? '');
            $stationType = (string) ($location['stationType'] ?? 'Downtown');

            if (empty($locationCode) || empty($name)) {
                continue;
            }

            $address = $location['address'] ?? [];
            $countryCode = (string) ($address['country']['code'] ?? '');
            $countryName = (string) ($address['country']['name'] ?? '');
            $city = (string) ($address['city'] ?? '');
            $lat = $address['coordinates']['lat'] ?? ($address['coordinates']['latitude'] ?? null);
            $lng = $address['coordinates']['lon'] ?? ($address['coordinates']['longitude'] ?? null);

            $currency = $this->resolveCurrency($countryCode);

            $validStationIds[] = $locationCode;

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $locationCode,
                ],
                [
                    'name' => $name,
                    'location' => $city,
                    'adresse' => implode(', ', $address['addressLine'] ?? [$name]),
                    'city' => $city,
                    'country' => $countryName ?: $this->resolveCountryName($countryCode),
                    'currency' => $currency,
                    'lat' => $lat,
                    'lng' => $lng,
                    'location_type' => $stationType,
                    'abriviation' => $extendedCode ?: $locationCode,
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

        // ------------------------------------------------------------------
        // 4. Delete branches no longer returned by Surprice
        // ------------------------------------------------------------------
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
        $this->info('========== Surprice Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Total    : " . count($locations));
        $this->info('===================================================');

        return self::SUCCESS;
    }

    /**
     * Resolve currency from ISO country code.
     */
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
            default => 'EUR',
        };
    }

    /**
     * Resolve full country name from ISO code.
     */
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
            default => $code,
        };
    }
}
