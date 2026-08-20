<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\GreenMotionApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;

class SyncGreenMotionBranches extends Command
{
    protected $signature = 'greenmotion:sync-branches {--dry-run : Only fetch from API and print what would be done} {--real : Perform the actual synchronization to the database} {--us-source : Use the US source credentials}';

    protected $description = 'Sync Green Motion locations as branches.';

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

        $username = $this->option('us-source') ? 'GMatob@2026!' : 'GMato@2026!';
        $password = $this->option('us-source') ? 'GMatob@2026!' : 'GMato@2026!';
        
        // Initialize the service with credentials provided by user
        $service = new GreenMotionApiService($username, $password);

        $supplierUser = User::firstOrCreate(
            ['email' => 'georgiaparkhurst@greenmotion.com'],
            [
                'name' => 'Green Motion',
                'role' => 'active_supplier',
                'password' => Hash::make('GreenMotion@123'),
                'company' => 'Green Motion',
            ]
        );
        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        $this->info('Fetching country list from Green Motion...');
        $countries = $service->getCountryList();

        if (empty($countries)) {
            $this->error('No countries returned from API.');
            return self::FAILURE;
        }

        $created = 0;
        $updated = 0;

        if (!$this->option('dry-run')) {
            $this->info('Clearing existing terms for Green Motion...');
            $existingTermIds = \App\Models\SupplierRentalTerm::where('supplier_id', $supplierUserId)->pluck('rental_term_id');
            \App\Models\SupplierRentalTerm::where('supplier_id', $supplierUserId)->delete();
            \App\Models\RentalTerms::whereIn('id', $existingTermIds)->delete();
        }

        foreach ($countries as $country) {
            $countryId = (int) ($country['countryID'] ?? 0);
            $countryName = (string) ($country['countryName'] ?? '');
            
            if (!$countryId) {
                continue;
            }

            $this->info("Fetching service areas for {$countryName} (ID: {$countryId})...");
            $locations = $service->getServiceAreas($countryId);

            foreach ($locations as $location) {
                $locationId = (string) ($location['locationID'] ?? '');
                $locationName = (string) ($location['name'] ?? '');

                if (empty($locationId) || empty($locationName)) {
                    continue;
                }

                if ($this->option('dry-run')) {
                    $this->line("[DRY RUN] Would sync location ID {$locationId} -> '{$locationName}' in {$countryName}");
                    continue;
                }

                $resolvedCountry = CountryCurrencyResolver::normalizeCountryName($countryName ?: 'Turkey') ?? $countryName;
                $currency = CountryCurrencyResolver::resolveCurrencyByCountryName($countryName ?: 'Turkey');

                $branch = Branch::updateOrCreate(
                    [
                        'company_id' => $supplierUserId,
                        'station_id' => $locationId,
                    ],
                    [
                        'name' => $locationName,
                        'location' => $locationName,
                        'adresse' => $locationName,
                        'city' => $locationName,
                        'country' => $resolvedCountry,
                        'currency' => $currency,
                        'location_type' => str_contains(strtolower($locationName), 'airport') ? 'Airport' : 'Downtown',
                        'abriviation' => $locationId,
                    ]
                );

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
                $this->info("Fetching policies for {$countryName}...");
                $termsCategories = $service->getTermsAndConditions($countryId);
                $policiesAdded = 0;

                foreach ($termsCategories as $category) {
                    $categoryName = (string) ($category['@attributes']['name'] ?? 'General');
                    
                    // A category can have multiple conditions
                    $conditions = $category['plaintext'] ?? $category['condition'] ?? [];
                    if (is_string($conditions)) {
                        $conditions = [$conditions];
                    } elseif (is_array($conditions) && isset($conditions[0])) {
                        // already an array of strings
                    } elseif (is_array($conditions)) {
                        $conditions = [];
                    }

                    $description = implode("\n", array_map('trim', $conditions));
                    $description = str_ireplace(['<br>', '<br />', '<br/>', '</p>', '</div>'], "\n", $description);
                    $description = strip_tags($description);
                    $description = html_entity_decode($description, ENT_QUOTES | ENT_HTML5, 'UTF-8');
                    $description = trim(preg_replace("/\n+/", "\n", $description));

                    if (!empty($description)) {
                        $term = \App\Models\RentalTerms::create([
                            'title' => $categoryName,
                            'description' => $description,
                            'status' => 'approved',
                            'created_by' => $supplierUserId,
                            'country' => $resolvedCountry ?? $countryName,
                        ]);

                        \App\Models\SupplierRentalTerm::create([
                            'rental_term_id' => $term->id,
                            'supplier_id' => $supplierUserId,
                            'country' => $resolvedCountry ?? $countryName,
                        ]);
                        $policiesAdded++;
                    }
                }
                $this->info("Successfully saved {$policiesAdded} policies for {$countryName}.");
            }
        }

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Created: {$created}, Updated: {$updated}.");
        }

        return self::SUCCESS;
    }
}
