<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\RoutesApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SyncRoutesBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'routes:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync branches from Routes API into Autours';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $service = new RoutesApiService();

        // 1. Resolve or create the Routes supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'tsingh@routes.ca'],
            [
                'name' => 'Routes Car Rental',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Routes',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Fetch locations from API
        $this->info('Fetching locations from Routes API...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->warn('No locations found or failed to fetch locations. Please ensure the API is reachable or load manually.');
            return self::FAILURE;
        }

        $this->info(sprintf('Found %d locations.', count($locations)));

        // 3. Process locations
        $syncedCount = 0;
        foreach ($locations as $loc) {
            $cleanAddress = preg_replace('/[\r\n]+/', ',', $loc['Address'] ?? '');
            $addressParts = array_values(array_filter(array_map('trim', explode(',', $cleanAddress))));
            $country = null;

            // 1. Try to resolve from address parts (from end to start)
            for ($i = count($addressParts) - 1; $i >= 0; $i--) {
                $part = rtrim($addressParts[$i], '.');
                $code = \App\Services\CountryCurrencyResolver::resolveCountryCode($part);
                if ($code) {
                    $country = \App\Services\CountryCurrencyResolver::resolveCountryName($code);
                    break;
                }
                if (strlen($part) === 2) {
                    $resolved = \App\Services\CountryCurrencyResolver::resolveCountryName(strtoupper($part));
                    if ($resolved !== strtoupper($part)) {
                        $country = $resolved;
                        break;
                    }
                }
            }

            // 2. Fallback to currency mapping if address doesn't explicitly contain the country
            if (!$country && !empty($loc['Currency'])) {
                $currencyMap = [
                    'AUD' => 'Australia', 'CAD' => 'Canada', 'NZD' => 'New Zealand', 'PLN' => 'Poland',
                    'TRY' => 'Turkey', 'GBP' => 'United Kingdom', 'MXN' => 'Mexico', 'JMD' => 'Jamaica',
                    'BBD' => 'Barbados', 'OMR' => 'Oman', 'QAR' => 'Qatar', 'JOD' => 'Jordan',
                    'MAD' => 'Morocco', 'CRC' => 'Costa Rica', 'PAB' => 'Panama', 'ALL' => 'Albania',
                    'COP' => 'Colombia', 'ISK' => 'Iceland', 'RON' => 'Romania', 'AMD' => 'Armenia',
                    'GEL' => 'Georgia', 'MUR' => 'Mauritius', 'PEN' => 'Peru', 'USD' => 'United States'
                ];
                if (isset($currencyMap[$loc['Currency']])) {
                    $country = $currencyMap[$loc['Currency']];
                }
            }

            // 3. Ultimate fallback: take the last alphanumeric part, or default to Canada
            if (!$country && !empty($addressParts)) {
                for ($i = count($addressParts) - 1; $i >= 0; $i--) {
                    $part = rtrim($addressParts[$i], '.');
                    if (preg_match('/[a-zA-Z]/', $part)) {
                        $country = $part;
                        break;
                    }
                }
            }
            $country = $country ?: 'Canada';

            // Upsert branch
            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $loc['LocationCode'],
                ],
                [
                    'name' => $loc['LocationName'] ?? $loc['LocationCode'],
                    'location' => $loc['LocationName'] ?? $loc['LocationCode'],
                    'address' => $loc['Address'] ?? null,
                    'adresse' => $loc['Address'] ?? null,
                    'phone' => $loc['ContactNumber'] ?? null,
                    'city' => $loc['LocationName'] ?? null,
                    'currency' => $loc['Currency'] ?? null,
                    'lat' => $loc['Latitude'] ?? null,
                    'lng' => $loc['Longitude'] ?? null,
                    'country' => $country,
                ]
            );

            // Normalize branch name/location against canonical airports
            $normalizer = new \App\Services\BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );
            $branch->update($normData);

            $syncedCount++;
        }

        $this->info("Successfully synced {$syncedCount} branches.");

        // 4. Fetch and save policies per country
        if (!empty($locations)) {
            // Group locations by country
            $locationsByCountry = [];
            foreach ($locations as $loc) {
                // Find the branch we just upserted to get the normalized country
                $branch = Branch::where('company_id', $supplierUser->id)
                                ->where('station_id', $loc['LocationCode'])
                                ->first();
                $country = $branch && $branch->country ? $branch->country : 'Canada';
                if (!isset($locationsByCountry[$country])) {
                    $locationsByCountry[$country] = [];
                }
                $locationsByCountry[$country][] = $loc['LocationCode'];
            }

            // Clear existing terms for this supplier to avoid duplicates
            $existingTermIds = \App\Models\SupplierRentalTerm::where('supplier_id', $supplierUser->id)->pluck('rental_term_id');
            \App\Models\SupplierRentalTerm::where('supplier_id', $supplierUser->id)->delete();
            \App\Models\RentalTerms::whereIn('id', $existingTermIds)->delete();

            foreach ($locationsByCountry as $country => $countryLocations) {
                $firstLoc = $countryLocations[0];
                $this->info("Fetching policies for {$country} using location code {$firstLoc}...");
                $policyXml = $service->getPolicy($firstLoc);

                if ($policyXml) {
                    $policiesAdded = 0;
                    $types = $policyXml->xpath('//PolicyType');
                    $texts = $policyXml->xpath('//PolicyText');

                    if ($types !== false && $texts !== false) {
                        for ($i = 0; $i < count($types); $i++) {
                            $type = (string)$types[$i];
                            $text = (string)$texts[$i];

                            $term = \App\Models\RentalTerms::create([
                                'title' => $type,
                                'description' => $text,
                                'status' => 'approved',
                                'created_by' => $supplierUser->id,
                                'country' => $country,
                            ]);

                            \App\Models\SupplierRentalTerm::create([
                                'rental_term_id' => $term->id,
                                'supplier_id' => $supplierUser->id,
                                'country' => $country,
                            ]);
                            
                            $policiesAdded++;
                        }
                    }
                    $this->info("Successfully saved {$policiesAdded} policies for {$country}.");
                } else {
                    $this->warn("Failed to fetch policies for {$country} (Location: {$firstLoc}).");
                }
            }
        }

        return self::SUCCESS;
    }
}
