<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
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

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $validStationIds = [];
        $syncedCountries = [];

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

            $currency = CountryCurrencyResolver::resolveCurrency($countryCode);
            $resolvedCountry = ucwords(strtolower($countryName ?: CountryCurrencyResolver::resolveCountryName($countryCode)));

            $validStationIds[] = $locationCode;

            // Fetch and sync terms per country
            if (!isset($syncedCountries[$resolvedCountry])) {
                try {
                    $details = $service->getLocationDetails($locationCode);
                    $policies = $details['policies'] ?? [];
                    
                    if (!empty($policies)) {
                        $this->info("Syncing terms for country: {$resolvedCountry} using location: {$locationCode}...");
                        foreach ($policies as $policy) {
                            $title = str_replace('_', ' ', ucwords(strtolower($policy['type'] ?? 'TERMS AND CONDITIONS')));
                            $term = \App\Models\RentalTerms::updateOrCreate(
                                [
                                    'created_by' => $supplierUser->id,
                                    'title' => $title,
                                    'country' => $resolvedCountry
                                ],
                                [
                                    'description' => $policy['text'] ?? '',
                                    'status' => 'approved',
                                    'branch_id' => null,
                                ]
                            );

                            \App\Models\SupplierRentalTerm::updateOrCreate([
                                'rental_term_id' => $term->id,
                                'supplier_id' => $supplierUser->id,
                                'country' => $resolvedCountry
                            ], [
                                'branch_id' => null,
                            ]);
                        }
                        $syncedCountries[$resolvedCountry] = true;
                    }
                } catch (\Exception $e) {
                    $this->warn("Failed to sync terms for country: {$resolvedCountry} ({$e->getMessage()})");
                }
            }

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
                    'country' => $resolvedCountry,
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

}
