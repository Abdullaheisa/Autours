<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\EmrJsonApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncEmrVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emr:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}
                            {--concurrency=15 : Number of concurrent API requests per batch}
                            {--timeout=15 : HTTP request timeout per API call in seconds}
                            {--limit=0 : Limit to N branches (0 = all)}
                            {--full-sync : Ignore empty-branch cache and query all branches}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from EMR/Turev Rent JSON API into Autours. Creates one vehicle record per branch with per-station prices.';

    /**
     * Cache of Specification definitions keyed by name.
     *
     * @var array<string, array>|null
     */
    private ?array $specDefinitions = null;

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Suppress PHP 8.5 deprecations from older Guzzle versions
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new EmrJsonApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the EMR supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'alicansarp@emrcarrental.com'],
            [
                'name' => 'Turev Rent (EMR)',
                'role' => 'active_supplier',
                'password' => Hash::make(Str::random(32)),
                'company' => 'Turev Rent',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Load local specification definitions
        // ------------------------------------------------------------------
        $this->loadSpecificationDefinitions();

        // ------------------------------------------------------------------
        // 3. Resolve all EMR branches
        // ------------------------------------------------------------------
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->orderBy('city')
            ->orderBy('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No EMR branches found. Run: php artisan emr:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // ------------------------------------------------------------------
        // 4. Clean up orphaned EMR images
        // ------------------------------------------------------------------
        $this->info('Cleaning up orphaned EMR images...');
        $activeEmrPhotos = Vehicle::where('description', 'LIKE', '%[EMR-GROUP-ID:%')
            ->whereNotNull('photo')
            ->pluck('photo')
            ->unique()
            ->values()
            ->toArray();

        $imgDir = public_path('img/vehicles');
        $cleaned = 0;
        if (is_dir($imgDir)) {
            foreach (glob($imgDir . '/emr_*') as $filePath) {
                $fileName = basename($filePath);
                if (! in_array($fileName, $activeEmrPhotos, true)) {
                    @unlink($filePath);
                    $cleaned++;
                }
            }
        }
        if ($cleaned > 0) {
            $this->info("Deleted {$cleaned} orphaned image(s).");
        }

        // Resolve dates
        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addDay()->format('Y-m-d 10:00');
        $dropoffDate1 = Carbon::parse($pickupDate)->addDay()->format('Y-m-d 10:00');
        $dropoffDate7 = Carbon::parse($pickupDate)->addDays(7)->format('Y-m-d 10:00');
        $dropoffDate30 = Carbon::parse($pickupDate)->addDays(30)->format('Y-m-d 10:00');

        $this->info("Using pickup: {$pickupDate}");

        // ------------------------------------------------------------------
        // 4. Fetch all groups
        // ------------------------------------------------------------------
        $this->info('Fetching vehicle groups from EMR...');
        $groups = $service->getGroups();

        if (empty($groups)) {
            $this->warn('No groups returned from EMR API. Aborting.');
            return self::FAILURE;
        }

        $this->info('Groups fetched: ' . count($groups));

        $groupsById = [];
        foreach ($groups as $group) {
            $gid = (string) ($group['group_id'] ?? '');
            if (! empty($gid)) {
                $groupsById[$gid] = $group;
            }
        }

        // ------------------------------------------------------------------
        // 5. Fetch prices for ALL stations concurrently
        // ------------------------------------------------------------------
        $pricesOnly = $this->option('prices-only');

        $stationToBranchMap = [];
        foreach ($allBranches as $branch) {
            $stationToBranchMap[$branch->station_id] = $branch->id;
        }

        $concurrency = (int) $this->option('concurrency');
        if ($concurrency < 1) {
            $concurrency = 15;
        }

        $timeout = (int) $this->option('timeout');
        if ($timeout >= 1) {
            $service->setTimeout($timeout);
        }

        $limit = (int) $this->option('limit');
        $fullSync = $this->option('full-sync');

        // Load cache of branches that previously had cars
        $cachePath = storage_path('app/emr_empty_branches_cache.json');
        $cachedEmptyBranches = [];
        if (file_exists($cachePath) && ! $fullSync) {
            $cachedEmptyBranches = json_decode(file_get_contents($cachePath), true) ?? [];
        }

        // Filter out branches that were empty last time (unless full-sync)
        $filteredStationMap = [];
        foreach ($stationToBranchMap as $stationId => $branchId) {
            if (! $fullSync && in_array((string) $branchId, $cachedEmptyBranches, true)) {
                continue;
            }
            $filteredStationMap[$stationId] = $branchId;
        }

        if (! empty($cachedEmptyBranches) && ! $fullSync) {
            $skipped = count($stationToBranchMap) - count($filteredStationMap);
            $this->info("Skipping {$skipped} branches that were empty last sync (use --full-sync to override).");
        }

        if ($limit > 0) {
            $filteredStationMap = array_slice($filteredStationMap, 0, $limit, true);
            $this->warn("Limiting sync to {$limit} branch(es) only.");
        }

        $totalStations = count($filteredStationMap);
        if ($totalStations === 0) {
            $this->warn('No branches to sync after filtering.');
            return self::FAILURE;
        }

        $this->info("Fetching 1-day prices for {$totalStations} station(s) with concurrency {$concurrency} and timeout {$timeout}s...");
        $progress1 = $this->output->createProgressBar($totalStations);
        $progress1->start();
        $stationPrices1 = $service->getAvailableCarsForStations(
            $filteredStationMap,
            $pickupDate,
            $dropoffDate1,
            'TL',
            $concurrency,
            function (int $processed) use ($progress1) {
                $progress1->advance($processed);
            }
        );
        $progress1->finish();
        $this->newLine();

        $this->info('Fetching 7-day prices...');
        $progress7 = $this->output->createProgressBar($totalStations);
        $progress7->start();
        $stationPrices7 = $service->getAvailableCarsForStations(
            $filteredStationMap,
            $pickupDate,
            $dropoffDate7,
            'TL',
            $concurrency,
            function (int $processed) use ($progress7) {
                $progress7->advance($processed);
            }
        );
        $progress7->finish();
        $this->newLine();

        $this->info('Fetching 30-day prices...');
        $progress30 = $this->output->createProgressBar($totalStations);
        $progress30->start();
        $stationPrices30 = $service->getAvailableCarsForStations(
            $filteredStationMap,
            $pickupDate,
            $dropoffDate30,
            'TL',
            $concurrency,
            function (int $processed) use ($progress30) {
                $progress30->advance($processed);
            }
        );
        $progress30->finish();
        $this->newLine();

        // Load branch currencies
        $branchCurrencies = Branch::whereIn('id', array_values($filteredStationMap))
            ->pluck('currency', 'id')
            ->toArray();

        // Load exchange rates from TRY
        $ratesFromTry = \App\Models\CurrencyRate::where('currency_from', 'TRY')
            ->pluck('rate', 'currency_to')
            ->toArray();

        // Combine prices into a single structure
        $stationPrices = [];
        foreach ($filteredStationMap as $stationId => $branchId) {
            $groups1 = $stationPrices1[$branchId] ?? [];
            $groups7 = $stationPrices7[$branchId] ?? [];
            $groups30 = $stationPrices30[$branchId] ?? [];
            
            $branchCurrency = $branchCurrencies[$branchId] ?? 'EUR';
            $multiplier = 1.0;
            if ($branchCurrency !== 'TRY' && $branchCurrency !== 'TL') {
                $multiplier = $ratesFromTry[$branchCurrency] ?? 1.0;
            }

            foreach ($groups1 as $groupId => $priceData) {
                $baseDayValue = $priceData['day_value'] ?? 0;
                $dayValue7 = $groups7[$groupId]['day_value'] ?? $baseDayValue;
                $dayValue30 = $groups30[$groupId]['day_value'] ?? $baseDayValue;
                
                if ($baseDayValue > 0) {
                    $priceData['day_value'] = round($baseDayValue * $multiplier, 2);
                    $priceData['week_price'] = round($dayValue7 * $multiplier, 2);
                    $priceData['month_price'] = round($dayValue30 * $multiplier, 2);
                    $stationPrices[$branchId][$groupId] = $priceData;
                }
            }
        }

        $this->info('Stations with valid prices: ' . count($stationPrices));

        // ------------------------------------------------------------------
        // 6. Pre-load existing EMR vehicles from DB
        // ------------------------------------------------------------------
        $allExistingEmrVehicles = Vehicle::where('description', 'LIKE', '%[EMR-GROUP-ID:%')
            ->get();

        $existingVehiclesByGroup = [];
        foreach ($allExistingEmrVehicles as $v) {
            if (preg_match('/\[EMR-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                $existingVehiclesByGroup[$m[1]][$v->pickup_loc] = $v;
            }
        }

        $this->info('Existing EMR vehicles in DB: ' . $allExistingEmrVehicles->count());

        // ------------------------------------------------------------------
        // 7. Loop through groups - create/update ONE vehicle per branch that has a price
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $deleted = 0;
        $deactivated = 0;
        $failed = 0;
        $syncedVehicleIds = [];

        foreach ($groupsById as $groupId => $group) {
            $groupId = (string) $groupId;
            try {
                // Determine which branches have a price > 0 for this group
                $branchesWithPrice = [];
                foreach ($stationPrices as $branchId => $prices) {
                    $priceData = $prices[$groupId] ?? null;
                    if ($priceData !== null && ($priceData['day_value'] ?? 0) > 0) {
                        $branchesWithPrice[$branchId] = $priceData;
                    }
                }

                // Get group details
                $groupName = (string) ($group['group_name'] ?? '');
                $brand = (string) ($group['brand'] ?? '');
                $type = (string) ($group['type'] ?? '');
                $vehicleName = trim($brand . ' ' . $type);
                if (empty($vehicleName)) {
                    $vehicleName = $groupName ?: 'EMR Group ' . $groupId;
                }
                $vehicleName = $this->normalizeVehicleName($vehicleName);

                $sipp = (string) ($group['sipp'] ?? '');
                $categoryId = $this->resolveCategoryFromSipp($sipp);

                $groupExistingVehicles = $existingVehiclesByGroup[$groupId] ?? [];

                // Determine if we actually need to download the image
                $needsImageDownload = false;
                $imageUrl = $group['image_path'] ?? null;
                if (! empty($imageUrl)) {
                    foreach ($branchesWithPrice as $branchId => $priceData) {
                        $existingVehicle = $groupExistingVehicles[$branchId] ?? null;
                        if (! $existingVehicle && ! $pricesOnly) {
                            $needsImageDownload = true;
                            break;
                        }
                        if ($existingVehicle && empty($existingVehicle->photo)) {
                            $needsImageDownload = true;
                            break;
                        }
                    }
                }

                // Try local photo first
                $photoFilename = $this->resolveLocalPhoto($vehicleName);

                // Download image once per group, only if needed and local not found
                if (empty($photoFilename) && $needsImageDownload) {
                    $photoFilename = $this->downloadImage($imageUrl, $groupId);
                }

                // Process branches WITH prices
                foreach ($branchesWithPrice as $branchId => $priceData) {
                    $existingVehicle = $groupExistingVehicles[$branchId] ?? null;

                    if ($pricesOnly && ! $existingVehicle) {
                        continue;
                    }

                    if ($existingVehicle) {
                        $vehicle = $existingVehicle;
                        $updateData = [
                            'price' => $priceData['day_value'],
                            'week_price' => $priceData['week_price'],
                            'month_price' => $priceData['month_price'],
                            'activation' => true,
                        ];
                        if ($vehicle->supplier != $supplierUser->id) {
                            $updateData['supplier'] = $supplierUser->id;
                        }
                        if (! empty($photoFilename) && empty($vehicle->photo)) {
                            $updateData['photo'] = $photoFilename;
                        }
                        $vehicle->update($updateData);



                        $updated++;
                    } else {
                        if ($pricesOnly) {
                            continue;
                        }

                        $vehicle = Vehicle::create([
                            'name' => $vehicleName,
                            'description' => '[EMR-GROUP-ID:' . $groupId . '] ' . ($groupName ? "({$groupName})" : ''),
                            'photo' => $photoFilename,
                            'supplier' => $supplierUser->id,
                            'activation' => true,
                            'pickup_loc' => $branchId,
                            'category' => $categoryId,
                            'fuel_policy_id' => null,
                            'price' => $priceData['day_value'],
                            'week_price' => $priceData['week_price'],
                            'month_price' => $priceData['month_price'],
                        ]);

                        // Create default profit record so vehicle shows up in search
                        \App\Models\Profit::create([
                            'vehicle_id' => $vehicle->id,
                            'supplier_id' => $supplierUser->id,
                            'branch_id' => $branchId,
                            'per_day_profit' => 10,
                            'per_week_profit' => 10,
                            'per_month_profit' => 10,
                            'weekend_profit' => 10,
                        ]);

                        $this->syncVehicleSpecifications($vehicle, $group);
                        $created++;
                    }

                    $syncedVehicleIds[] = $vehicle->id;
                }

                // Deactivate vehicles for this group at branches that no longer have prices
                $pricedBranchIds = array_keys($branchesWithPrice);
                $missingBranchVehicles = Vehicle::where('description', 'LIKE', '%[EMR-GROUP-ID:' . $groupId . ']%')
                    ->whereNotIn('pickup_loc', $pricedBranchIds)
                    ->where('activation', true)
                    ->get();

                foreach ($missingBranchVehicles as $mbv) {
                    $mbv->update([
                        'activation' => false,
                        'price' => 0,
                        'week_price' => 0,
                        'month_price' => 0,
                    ]);
                    $deactivated++;
                }
            } catch (\Exception $e) {
                $failed++;
                $this->error("Failed group {$groupId}: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // 8. Delete orphaned EMR vehicles no longer in any group
        // ------------------------------------------------------------------
        if (! $pricesOnly && ! empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('description', 'LIKE', '%[EMR-GROUP-ID:%')
                ->whereNotIn('id', $syncedVehicleIds)
                ->get();

            foreach ($orphaned as $orphanedVehicle) {
                $this->deleteVehicle($orphanedVehicle);
                $deleted++;
                $this->info("Deleted orphaned: {$orphanedVehicle->name}");
            }
        }

        // ------------------------------------------------------------------
        // 9. Delete empty branches (no active vehicles left)
        // ------------------------------------------------------------------
        $branchesDeleted = 0;
        $emptyBranches = Branch::where('company_id', $supplierUser->id)
            ->whereDoesntHave('vehicles', function ($q) {
                $q->whereNull('deleted_at');
            })
            ->get();

        foreach ($emptyBranches as $emptyBranch) {
            $emptyBranch->delete();
            $branchesDeleted++;
            $this->warn("Deleted empty branch: {$emptyBranch->name}");
        }

        // ------------------------------------------------------------------
        // 10. Save empty-branch cache for next run
        // ------------------------------------------------------------------
        $branchesWithResults = array_keys($stationPrices);
        $newEmptyBranches = [];
        foreach ($filteredStationMap as $stationId => $branchId) {
            if (! in_array((int) $branchId, $branchesWithResults, true) && ! in_array((string) $branchId, $branchesWithResults, true)) {
                $newEmptyBranches[] = (string) $branchId;
            }
        }
        file_put_contents($cachePath, json_encode($newEmptyBranches));
        @chmod($cachePath, 0666);

        // ------------------------------------------------------------------
        // 11. Summary
        // ------------------------------------------------------------------
        $this->newLine();
        $this->info('========== EMR Vehicle Sync Complete ==========');
        $this->info("Created     : {$created}");
        $this->info("Updated     : {$updated}");
        $this->info("Deactivated : {$deactivated}");
        $this->info("Deleted     : {$deleted}");
        $this->info("Failed      : {$failed}");
        if ($branchesDeleted > 0) {
            $this->info("Empty branches deleted: {$branchesDeleted}");
        }
        $this->info('==============================================');

        // ------------------------------------------------------------------
        // 12. Write summary text file
        // ------------------------------------------------------------------
        $totalVehiclesWithPrice = 0;
        foreach ($stationPrices as $branchId => $prices) {
            $totalVehiclesWithPrice += count($prices);
        }

        $summaryPath = storage_path('app/emr_sync_summary.txt');
        $summaryText = sprintf(
            "EMR Sync Summary\n=================\nDate: %s\nStations with prices: %d\nVehicles with prices: %d\n",
            now()->toDateTimeString(),
            count($stationPrices),
            $totalVehiclesWithPrice
        );
        file_put_contents($summaryPath, $summaryText);
        @chmod($summaryPath, 0666);
        $this->info("Summary written to: {$summaryPath}");

        return self::SUCCESS;
    }

    /* ---------------------------------------------------------------------- */
    /*  Private helpers                                                       */
    /* ---------------------------------------------------------------------- */

    /**
     * Delete a vehicle and all its related records.
     */
    private function deleteVehicle(Vehicle $vehicle): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();
        $vehicle->delete();
    }

    /**
     * Load Specification definitions from the local DB into memory.
     */
    private function loadSpecificationDefinitions(): void
    {
        $this->specDefinitions = [];
        foreach (Specification::all() as $spec) {
            $this->specDefinitions[$spec->name] = [
                'id' => $spec->id,
                'icon' => $spec->icon,
                'options' => $spec->options ?? [],
            ];
        }
    }

    /**
     * Sync vehicle specifications from EMR group data.
     */
    private function syncVehicleSpecifications(Vehicle $vehicle, array $group): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

        // --- Doors ---
        $doors = $group['doors'] ?? null;
        if ($doors !== null && $doors !== '' && isset($this->specDefinitions['Doors'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Doors',
                'value' => (string) $doors,
                'icon' => $this->specDefinitions['Doors']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Number of seats ---
        $seats = $group['chairs'] ?? null;
        if ($seats !== null && $seats !== '' && isset($this->specDefinitions['Number of seats'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Number of seats',
                'value' => (string) $seats,
                'icon' => $this->specDefinitions['Number of seats']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $sipp = (string) ($group['sipp'] ?? '');

        // --- Transmission ---
        if (isset($this->specDefinitions['Transmission'])) {
            $transmission = (string) ($group['transmission'] ?? '');
            $transValue = $sipp ? \App\Services\SippDecoder::getLocalTransmissionName($sipp) : ($transmission ? $this->normalizeTransmission($transmission) : 'Manual Transmission');
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transValue,
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Suitcase (map bag count to size category) ---
        $bigBags = (int) ($group['big_bags'] ?? 0);
        $smallBags = (int) ($group['small_bags'] ?? 0);
        $totalBags = $bigBags + $smallBags;
        if ($totalBags > 0 && isset($this->specDefinitions['Suitcase'])) {
            $suitValue = $this->mapBagCount($totalBags);
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Suitcase',
                'value' => $suitValue,
                'icon' => $this->specDefinitions['Suitcase']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Air Conditioner (default to available) ---
        if (isset($this->specDefinitions['Air Conditioner'])) {
            $acOptions = $this->specDefinitions['Air Conditioner']['options'] ?? [];
            $acValue = $sipp ? \App\Services\SippDecoder::getLocalAcName($sipp) : ($acOptions[0] ?? 'cool & Heat');
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Air Conditioner',
                'value' => $acValue,
                'icon' => $this->specDefinitions['Air Conditioner']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Fuel ---
        if (isset($this->specDefinitions['Fuel'])) {
            $fuel = (string) ($group['fuel'] ?? '');
            $fuelType = $sipp ? \App\Services\SippDecoder::getLocalFuelName($sipp) : ($fuel ? $this->normalizeFuel($fuel) : 'Petrol');
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Fuel',
                'value' => $fuelType,
                'icon' => $this->specDefinitions['Fuel']['icon'] ?? 'gas-pump',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (! empty($records)) {
            VehicleSpecification::query()->insert($records);
        }
    }

    /**
     * Resolve the local category ID from a SIPP code.
     */
    private function resolveCategoryFromSipp(string $sipp): int
    {
        $categoryName = \App\Services\SippDecoder::getLocalCategoryName($sipp);

        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        // Fallback: use "Economy"
        $fallback = \App\Models\Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : (\App\Models\Category::first()?->id ?? 1);
    }

    /**
     * Map total bag count to suitcase size category.
     */
    private function mapBagCount(int $count): string
    {
        if ($count <= 2) {
            return 'Small';
        }
        if ($count <= 5) {
            return 'Medium';
        }
        return 'large';
    }

    /**
     * Normalize transmission value to local spec option.
     */
    private function normalizeTransmission(string $value): string
    {
        $lower = strtolower($value);
        if (str_contains($lower, 'otomatik') || str_contains($lower, 'automatic') || str_contains($lower, 'auto')) {
            return 'Automatic Transmission';
        }
        return 'Manual Transmission';
    }

    /**
     * Normalize fuel value to local spec option.
     */
    private function normalizeFuel(string $value): string
    {
        $lower = strtolower($value);

        if (str_contains($lower, 'elektrik') || str_contains($lower, 'electric')) {
            return 'Electric';
        }
        if (str_contains($lower, 'hibrit') || str_contains($lower, 'hybrid')) {
            return 'Hybrid Petrol & Gas';
        }
        if (str_contains($lower, 'lpg') || str_contains($lower, 'gaz') || str_contains($lower, 'gas')) {
            return 'Gas';
        }
        // Benzin, Dizel, Diesel -> all map to Petrol (Diesel is not in local options)
        return 'Petrol';
    }

    /**
     * Download an external image and save it to public/img/vehicles/.
     */
    /**
     * In-memory cache of already-resolved images in the current run.
     *
     * @var array<string, string|null>
     */
    private array $imageCache = [];

    private function downloadImage(?string $url, string $groupId): ?string
    {
        if (empty($url)) {
            return null;
        }

        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            return $url;
        }

        $cacheKey = $groupId . '|' . $url;
        if (array_key_exists($cacheKey, $this->imageCache)) {
            return $this->imageCache[$cacheKey];
        }

        // Derive filename from URL extension first, fallback to mime-type later
        $extension = pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'emr_' . Str::slug($groupId) . '.' . $extension;
        $directory = public_path('img/vehicles');
        $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;

        // If file already exists locally, reuse it without downloading
        if (file_exists($fullPath) && filesize($fullPath) > 0) {
            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        }

        try {
            $response = Http::timeout(15)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                Log::warning("EMR image download failed (HTTP {$response->status()})", ['url' => $url]);
                $this->imageCache[$cacheKey] = null;
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $body = $response->body();

            if (! str_starts_with($contentType, 'image/')) {
                Log::warning("EMR resolved URL did not return an image", [
                    'url' => $url,
                    'content_type' => $contentType,
                ]);
                $this->imageCache[$cacheKey] = null;
                return null;
            }

            $extension = 'jpg';
            $mimeTypes = new MimeTypes();
            $extensions = $mimeTypes->getExtensions(strtok($contentType, ';'));
            if (! empty($extensions)) {
                $extension = $extensions[0];
            }

            $filename = 'emr_' . Str::slug($groupId) . '.' . $extension;
            $directory = public_path('img/vehicles');

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;
            file_put_contents($fullPath, $body);
            @chmod($fullPath, 0666);

            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        } catch (\Exception $e) {
            Log::warning("EMR image download exception", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $this->imageCache[$cacheKey] = null;
            return null;
        }
    }
}
