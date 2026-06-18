<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
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
            $currency = $this->resolveCurrency($countryCode);

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
                    'country' => $this->resolveCountryName($countryCode),
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

    private function resolveCurrency(string $countryCode): string
    {
        return match (strtoupper($countryCode)) {
            'AE' => 'AED',
            'AI' => 'XCD',
            'AL' => 'ALL',
            'AM' => 'AMD',
            'AT' => 'EUR',
            'AU' => 'AUD',
            'AZ' => 'AZN',
            'BA' => 'BAM',
            'BE' => 'EUR',
            'BG' => 'BGN',
            'BY' => 'BYN',
            'CH' => 'CHF',
            'CL' => 'CLP',
            'CW' => 'ANG',
            'CY' => 'EUR',
            'CZ' => 'CZK',
            'DE' => 'EUR',
            'DK' => 'DKK',
            'DO' => 'DOP',
            'EE' => 'EUR',
            'EG' => 'EGP',
            'ES' => 'EUR',
            'FI' => 'EUR',
            'FR' => 'EUR',
            'GB' => 'GBP',
            'GE' => 'GEL',
            'GR' => 'EUR',
            'GT' => 'GTQ',
            'HR' => 'EUR',
            'HU' => 'HUF',
            'IE' => 'EUR',
            'IS' => 'ISK',
            'IT' => 'EUR',
            'JO' => 'JOD',
            'LK' => 'LKR',
            'LT' => 'EUR',
            'LU' => 'EUR',
            'LV' => 'EUR',
            'MA' => 'MAD',
            'MD' => 'MDL',
            'ME' => 'EUR',
            'MF' => 'EUR',
            'MK' => 'MKD',
            'MT' => 'EUR',
            'MU' => 'MUR',
            'MY' => 'MYR',
            'NL' => 'EUR',
            'NO' => 'NOK',
            'NZ' => 'NZD',
            'PA' => 'PAB',
            'PL' => 'PLN',
            'PR' => 'USD',
            'PT' => 'EUR',
            'QA' => 'QAR',
            'RO' => 'RON',
            'RS' => 'RSD',
            'RU' => 'RUB',
            'SA' => 'SAR',
            'SC' => 'SCR',
            'SE' => 'SEK',
            'SI' => 'EUR',
            'SK' => 'EUR',
            'SX' => 'ANG',
            'TR' => 'TRY',
            'UA' => 'UAH',
            'US' => 'USD',
            'UZ' => 'UZS',
            'XK' => 'EUR',
            'ZA' => 'ZAR',
            default => 'EUR',
        };
    }

    private function resolveCountryName(string $code): string
    {
        if (empty($code)) {
            return '';
        }

        return match (strtoupper($code)) {
            'AE' => 'United Arab Emirates',
            'AI' => 'Anguilla',
            'AL' => 'Albania',
            'AM' => 'Armenia',
            'AT' => 'Austria',
            'AU' => 'Australia',
            'AZ' => 'Azerbaijan',
            'BA' => 'Bosnia and Herzegovina',
            'BE' => 'Belgium',
            'BG' => 'Bulgaria',
            'BY' => 'Belarus',
            'CH' => 'Switzerland',
            'CL' => 'Chile',
            'CW' => 'Curaçao',
            'CY' => 'Cyprus',
            'CZ' => 'Czech Republic',
            'DE' => 'Germany',
            'DK' => 'Denmark',
            'DO' => 'Dominican Republic',
            'EE' => 'Estonia',
            'EG' => 'Egypt',
            'ES' => 'Spain',
            'FI' => 'Finland',
            'FR' => 'France',
            'GB' => 'United Kingdom',
            'GE' => 'Georgia',
            'GR' => 'Greece',
            'GT' => 'Guatemala',
            'HR' => 'Croatia',
            'HU' => 'Hungary',
            'IE' => 'Ireland',
            'IS' => 'Iceland',
            'IT' => 'Italy',
            'JO' => 'Jordan',
            'LK' => 'Sri Lanka',
            'LT' => 'Lithuania',
            'LU' => 'Luxembourg',
            'LV' => 'Latvia',
            'MA' => 'Morocco',
            'MD' => 'Moldova',
            'ME' => 'Montenegro',
            'MF' => 'Saint Martin',
            'MK' => 'North Macedonia',
            'MT' => 'Malta',
            'MU' => 'Mauritius',
            'MY' => 'Malaysia',
            'NL' => 'Netherlands',
            'NO' => 'Norway',
            'NZ' => 'New Zealand',
            'PA' => 'Panama',
            'PL' => 'Poland',
            'PR' => 'Puerto Rico',
            'PT' => 'Portugal',
            'QA' => 'Qatar',
            'RO' => 'Romania',
            'RS' => 'Serbia',
            'RU' => 'Russia',
            'SA' => 'Saudi Arabia',
            'SC' => 'Seychelles',
            'SE' => 'Sweden',
            'SI' => 'Slovenia',
            'SK' => 'Slovakia',
            'SX' => 'Sint Maarten',
            'TR' => 'Turkey',
            'UA' => 'Ukraine',
            'US' => 'United States',
            'UZ' => 'Uzbekistan',
            'XK' => 'Kosovo',
            'ZA' => 'South Africa',
            default => $code,
        };
    }
}
