<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\AutofixRestApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncAutofixBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'autofix:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Autofix locations as branches.';

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

        $service = new AutofixRestApiService('eff6LWe8plkb2ewqpRMkLQ==', '2962AA3');

        // ------------------------------------------------------------------
        // 1. Resolve or create the Autofix supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'info@autofixrental.com'],
            [
                'name' => 'Autofix',
                'role' => 'active_supplier',
                'password' => Hash::make('Autofix@12345'),
                'company' => 'Autofix Rental',
            ]
        );
        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all locations from Kolaycar API
        // ------------------------------------------------------------------
        $this->info('Fetching locations from Autofix...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->error('No locations returned from Autofix API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $isDryRun = $this->option('dry-run');

        if (!$isDryRun) {
            $progress = $this->output->createProgressBar(count($locations));
            $progress->start();
        }

        foreach ($locations as $location) {
            $locationId = (string) ($location['locationId'] ?? '');
            $locationName = (string) ($location['locationName'] ?? '');
            $city = $locationName;
            $country = (string) ($location['countryName'] ?? '');
            $address = (string) ($location['address'] ?? $city);
            
            $lat = $location['coordinate']['latitude'] ?? null;
            $lng = $location['coordinate']['longitude'] ?? null;

            if (empty($locationId) || empty($locationName)) {
                if (!$isDryRun) $progress->advance();
                continue;
            }

            if ($isDryRun) {
                $this->line("[DRY RUN] Would sync location ID {$locationId} -> '{$locationName}'");
                continue;
            }

            $countryCode = CountryCurrencyResolver::resolveCountryCode($country ?: 'Turkey');
            if (empty($countryCode)) {
                $countryCode = 'TR'; // fallback
            }
            $countryName = CountryCurrencyResolver::resolveCountryName($countryCode);
            $currency = CountryCurrencyResolver::resolveCurrency($countryCode);

            $branchData = [
                'name' => $locationName,
                'location' => $locationName,
                'adresse' => $address ?: $locationName,
                'city' => $city ?: $locationName,
                'country' => $countryName,
                'currency' => $currency,
                'lat' => $lat,
                'lng' => $lng,
                'location_type' => str_contains(strtolower($locationName), 'airport') ? 'Airport' : 'Downtown',
                'abriviation' => $locationId,
            ];

            // Normalize branch name/location against canonical airports
            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branchData['name'],
                $branchData['city'],
                $branchData['country'],
                $locationId,
                $branchData['abriviation']
            );

            if (!empty($normData['airport_id'])) {
                $branchData['airport_id'] = $normData['airport_id'];
                $branchData['name'] = $normData['normalized_name'];
                $branchData['location'] = $normData['location'];
                $branchData['city'] = $normData['location'];
                $branchData['country'] = $normData['country'] ?? $branchData['country'];
                $branchData['abriviation'] = $normData['abriviation'] ?? $branchData['abriviation'];
                $branchData['location_type'] = 'Airport';
            } else {
                $branchData['airport_id'] = null;
                if (!empty($normData['location'])) {
                    $branchData['location'] = $normData['location'];
                }
            }

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUserId,
                    'station_id' => $locationId,
                ],
                $branchData
            );

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
            
            if (!$isDryRun) $progress->advance();
        }

        if (!$isDryRun) {
            $progress->finish();
            $this->newLine();
            $this->info("Branch Sync complete. Created: {$created}, Updated: {$updated}.");
        }

        return self::SUCCESS;
    }
}
