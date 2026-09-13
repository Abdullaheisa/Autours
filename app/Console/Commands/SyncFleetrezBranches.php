<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\FleetrezApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;

class SyncFleetrezBranches extends Command
{
    protected $signature = 'fleetrez:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database}';

    protected $description = 'Sync Fleetrez locations as branches.';

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

        $supplierUser = User::firstOrCreate(
            ['email' => 'emissias@h-lead.gr'],
            [
                'name' => 'h-lead.gr',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'H-Lead Fleetrez',
                'integration_type' => 'fleetrez',
                'api_key' => 'hleadfleetrezapi@autours.com',
                'api_password' => 'Aut26@!',
            ]
        );
        $supplierUserId = $supplierUser->id;

        $username = $supplierUser->api_key ?: 'hleadfleetrezapi@autours.com';
        $password = $supplierUser->api_password ?: 'Aut26@!';
        
        $service = new FleetrezApiService($username, $password);
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        $this->info('Fetching location list from Fleetrez API...');
        
        try {
            $locations = $service->getLocations();
        } catch (\Exception $e) {
            $this->error('Error fetching locations: ' . $e->getMessage());
            return self::FAILURE;
        }

        if (empty($locations)) {
            $this->error('No locations returned from API.');
            return self::FAILURE;
        }

        $created = 0;
        $updated = 0;

        $this->output->progressStart(count($locations));

        foreach ($locations as $location) {
            $locationId = (string) ($location['id'] ?? '');
            $locationCode = (string) ($location['code'] ?? '');
            $locationName = (string) ($location['name'] ?? '');

            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            if ($this->option('dry-run')) {
                $this->line("[DRY RUN] Would sync location ID {$locationId} ({$locationCode}) -> '{$locationName}'");
                continue;
            }

            // Fleetrez JSON doesn't provide explicit country, assuming Greece because of h-lead.gr domain
            $countryName = 'Greece';
            $resolvedCountry = CountryCurrencyResolver::normalizeCountryName($countryName) ?? $countryName;
            $currency = CountryCurrencyResolver::resolveCurrencyByCountryName($countryName);

            $branch = Branch::withTrashed()->updateOrCreate(
                [
                    'company_id' => $supplierUserId,
                    'station_id' => $locationId,
                ],
                [
                    'name' => $locationName,
                    'location' => $locationName,
                    'adresse' => $location['address1'] ?? $locationName,
                    'city' => $locationName,
                    'country' => $resolvedCountry,
                    'currency' => $currency,
                    'location_type' => (!empty($location['atAirport'])) ? 'Airport' : 'Downtown',
                    'abriviation' => $locationCode ?: $locationId,
                ]
            );

            if ($branch->trashed()) {
                $branch->restore();
            }

            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city ?? '',
                '', // Pass empty country to let normalizer fallback to IATA perfectly
                $branch->station_id,
                $branch->abriviation
            );
            
            $finalCountry = $normData['country'] ?? $branch->country;
            $finalCurrency = CountryCurrencyResolver::resolveCurrencyByCountryName($finalCountry);

            $branch->update(array_filter([
                'airport_id' => $normData['airport_id'] ?? null,
                'name' => $normData['normalized_name'] ?? null,
                'location' => $normData['location'] ?? null,
                'abriviation' => $normData['abriviation'] ?? null,
                'country' => $finalCountry,
                'currency' => $finalCurrency,
            ]));

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }

            $this->output->progressAdvance();
        }

        $this->output->progressFinish();

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Created: {$created}, Updated: {$updated}.");
        }

        return self::SUCCESS;
    }
}
