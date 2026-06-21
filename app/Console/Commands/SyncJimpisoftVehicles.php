<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\JimpisoftApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncJimpisoftVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jimpisoft:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--prices-only : Only refresh per-station prices, do not re-create vehicles}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Jimpisoft/Rentway API into Autours22. Creates one vehicle record per branch with per-station prices.';

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
        $service = new JimpisoftApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Jimpisoft supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'Jincy@drivus.ae'],
            [
                'name' => 'Drivus',
                'role' => 'active_supplier',
                'password' => Hash::make(Str::random(32)),
                'company' => 'Drivus',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Load local specification definitions
        // ------------------------------------------------------------------
        $this->loadSpecificationDefinitions();

        // ------------------------------------------------------------------
        // 3. Resolve all Jimpisoft branches
        // ------------------------------------------------------------------
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->orderBy('city')
            ->orderBy('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Jimpisoft branches found. Run: php artisan jimpisoft:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // Resolve dates
        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addDay()->format('Y-m-d 10:00');
        $dropoffDate1 = Carbon::parse($pickupDate)->addDay()->format('Y-m-d 10:00');
        $dropoffDate7 = Carbon::parse($pickupDate)->addDays(7)->format('Y-m-d 10:00');
        $dropoffDate30 = Carbon::parse($pickupDate)->addDays(30)->format('Y-m-d 10:00');

        $this->info("Using pickup: {$pickupDate}");

        // ------------------------------------------------------------------
        // 4. Fetch all groups
        // ------------------------------------------------------------------
        $this->info('Fetching vehicle groups from Jimpisoft...');
        $groups = $service->getGroups();

        if (empty($groups)) {
            $this->warn('No groups returned from Jimpisoft API. Aborting.');
            return self::FAILURE;
        }

        $this->info('Groups fetched: ' . count($groups));

        $groupIds = array_map(
            static fn (array $g): string => (string) ($g['GroupID'] ?? $g['groupID'] ?? ''),
            $groups
        );
        $groupIds = array_values(array_filter($groupIds));

        // ------------------------------------------------------------------
        // 5. Fetch prices for ALL stations concurrently
        // ------------------------------------------------------------------
        $pricesOnly = $this->option('prices-only');

        // Build station_id => branch_id map
        $stationToBranchMap = [];
        foreach ($allBranches as $branch) {
            $stationToBranchMap[$branch->station_id] = $branch->id;
        }

        $this->info('Fetching 1-day prices for ' . count($stationToBranchMap) . ' station(s) concurrently...');
        $stationPrices1 = $service->getMultiplePricesForStations(
            null,
            $pickupDate,
            $dropoffDate1,
            $stationToBranchMap
        );

        $this->info('Fetching 7-day prices...');
        $stationPrices7 = $service->getMultiplePricesForStations(
            null,
            $pickupDate,
            $dropoffDate7,
            $stationToBranchMap
        );

        $this->info('Fetching 30-day prices...');
        $stationPrices30 = $service->getMultiplePricesForStations(
            null,
            $pickupDate,
            $dropoffDate30,
            $stationToBranchMap
        );

        // Combine prices into a single structure
        $stationPrices = [];
        foreach ($stationToBranchMap as $stationId => $branchId) {
            $groups1 = $stationPrices1[$branchId] ?? [];
            $groups7 = $stationPrices7[$branchId] ?? [];
            $groups30 = $stationPrices30[$branchId] ?? [];
            
            foreach ($groups1 as $groupId => $priceData) {
                // The API returns day_value which is the daily base rate (without VAT).
                // We use day_value multiplied by the number of days for accurate base weekly/monthly totals.
                $baseDayValue = $priceData['day_value'] ?? 0;
                $dayValue7 = $groups7[$groupId]['day_value'] ?? $baseDayValue;
                $dayValue30 = $groups30[$groupId]['day_value'] ?? $baseDayValue;
                
                if ($baseDayValue > 0) {
                    $priceData['day_value'] = $baseDayValue;
                    $priceData['week_price'] = round($dayValue7 * 7, 2);
                    $priceData['month_price'] = round($dayValue30 * 30, 2);
                    $stationPrices[$branchId][$groupId] = $priceData;
                }
            }
        }

        $this->info('Stations with valid prices: ' . count($stationPrices));

        // ------------------------------------------------------------------
        // 6. Pre-load existing Jimpisoft vehicles from DB
        // ------------------------------------------------------------------
        $allExistingJimpisoftVehicles = Vehicle::where('description', 'LIKE', '%[JIMPI-GROUP-ID:%')
            ->get();

        $existingVehiclesByGroup = [];
        foreach ($allExistingJimpisoftVehicles as $v) {
            if (preg_match('/\[JIMPI-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                $existingVehiclesByGroup[$m[1]][$v->pickup_loc] = $v;
            }
        }

        $this->info('Existing Jimpisoft vehicles in DB: ' . $allExistingJimpisoftVehicles->count());

        // ------------------------------------------------------------------
        // 7. Loop through groups - create ONE vehicle per branch that has a price
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $deleted = 0;
        $failed  = 0;
        $syncedVehicleIds = [];

        foreach ($groups as $group) {
            $groupId = (string) ($group['GroupID'] ?? $group['groupID'] ?? null);

            if (empty($groupId)) {
                $failed++;
                continue;
            }

            try {
                // Determine which branches have a price > 0 for this group
                $branchesWithPrice = [];
                foreach ($stationPrices as $branchId => $prices) {
                    $priceData = $prices[$groupId] ?? null;
                    $dayValue = $priceData['day_value'] ?? null;
                    
                    if ($dayValue !== null && $dayValue > 0) {
                        $currencyFrom = $priceData['currency'] ?? null;
                        $branch = $allBranches->firstWhere('id', $branchId);
                        $currencyTo = $branch ? $branch->currency : null;

                        // Convert currency if Jimpisoft's returned currency differs from the branch's currency
                        if (!empty($currencyFrom) && !empty($currencyTo) && $currencyFrom !== $currencyTo) {
                            $rate = \App\Models\CurrencyRate::where('currency_from', $currencyFrom)
                                ->where('currency_to', $currencyTo)
                                ->first();
                            if ($rate) {
                                $priceData['day_value'] = round($dayValue * $rate->rate, 2);
                                $priceData['week_price'] = round($priceData['week_price'] * $rate->rate, 2);
                                $priceData['month_price'] = round($priceData['month_price'] * $rate->rate, 2);
                                $priceData['currency'] = $currencyTo;
                            }
                        }

                        $branchesWithPrice[$branchId] = $priceData;
                    }
                }

                // No prices at any station -> delete all vehicles for this group
                if (empty($branchesWithPrice)) {
                    $groupVehicles = $existingVehiclesByGroup[$groupId] ?? [];
                    foreach ($groupVehicles as $gv) {
                        $this->deleteVehicle($gv);
                        $deleted++;
                    }
                    continue;
                }

                // Merge inclusions across all branches to avoid missing them
                $mergedInclusions = [];
                foreach ($branchesWithPrice as $pData) {
                    if (!empty($pData['inclusions'])) {
                        foreach ($pData['inclusions'] as $inc) {
                            $mergedInclusions[$inc] = true;
                        }
                    }
                }
                $mergedInclusionList = array_keys($mergedInclusions);

                $groupExistingVehicles = $existingVehiclesByGroup[$groupId] ?? [];

                // Determine if we need to fetch group details.
                // We need details when creating new vehicles OR when existing vehicles
                // are missing specifications (e.g. fuel was added after initial sync).
                $needsDetails = false;
                if (! $pricesOnly) {
                    foreach ($branchesWithPrice as $branchId => $priceData) {
                        $existingVehicle = $groupExistingVehicles[$branchId] ?? null;
                        if (! $existingVehicle) {
                            $needsDetails = true;
                            break;
                        }

                        if (empty($existingVehicle->photo)) {
                            $needsDetails = true;
                            break;
                        }
                    }
                }

                // Fetch group details and image once per group
                $details = null;
                $vehicleName = null;
                $photoFilename = null;

                if ($needsDetails) {
                    $details = $service->getGroupDetails($groupId);

                    if (! empty($details)) {
                        $brand = trim($details['brand'] ?? $details['Brand'] ?? '');
                        $model = trim($details['model'] ?? $details['Model'] ?? '');
                        $vehicleName = trim($brand . ' ' . $model);
                        if (empty($vehicleName)) {
                            $vehicleName = (string) ($group['Group_Name'] ?? $group['group_Name'] ?? $groupId);
                        }
                        $vehicleName = $this->normalizeVehicleName($vehicleName);

                        $photoFilename = $this->resolveLocalPhoto($vehicleName) ?? $this->downloadImage(
                            $details['imageURL'] ?? $details['ImageURL'] ?? null,
                            $groupId
                        );
                    }
                }

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
                        ];
                        // Normalize supplier to current Jimpisoft user if it differs
                        if ($vehicle->supplier != $supplierUser->id) {
                            $updateData['supplier'] = $supplierUser->id;
                        }
                        // Backfill photo if missing
                        if (empty($vehicle->photo) && ! empty($photoFilename)) {
                            $updateData['photo'] = $photoFilename;
                        }
                        $vehicle->update($updateData);

                        if (!$vehicle->profit) {
                            \App\Models\Profit::create([
                                'vehicle_id' => $vehicle->id,
                                'supplier_id' => $supplierUser->id,
                                'branch_id' => $vehicle->pickup_loc,
                                'per_day_profit' => 5,
                                'per_week_profit' => 5,
                                'per_month_profit' => 5,
                                'weekend_profit' => 5,
                            ]);
                        }



                        $updated++;
                    } else {
                        if ($pricesOnly) {
                            continue;
                        }

                        if (empty($details)) {
                            $failed++;
                            continue;
                        }

                        $vehicle = Vehicle::create([
                            'name' => $vehicleName,
                            'description' => '[JIMPI-GROUP-ID:' . $groupId . '] ' . ($details['details'] ?? $details['Details'] ?? ''),
                            'photo' => $photoFilename,
                            'supplier' => $supplierUser->id,
                            'activation' => true,
                            'pickup_loc' => $branchId,
                            'category' => $this->resolveCategory($groupId, $details),
                            'fuel_policy_id' => null,
                            'price' => $priceData['day_value'],
                            'week_price' => $priceData['week_price'],
                            'month_price' => $priceData['month_price'],
                        ]);

                        \App\Models\Profit::create([
                            'vehicle_id' => $vehicle->id,
                            'supplier_id' => $supplierUser->id,
                            'branch_id' => $branchId,
                            'per_day_profit' => 5,
                            'per_week_profit' => 5,
                            'per_month_profit' => 5,
                            'weekend_profit' => 5,
                        ]);

                        $this->syncVehicleSpecifications($vehicle, $details);

                        if (!empty($mergedInclusionList)) {
                            $includedIds = [];
                            foreach ($mergedInclusionList as $incText) {
                                $inc = \App\Models\Included::firstOrCreate(['what_is_included' => $incText]);
                                $includedIds[] = $inc->id;
                            }
                            $vehicle->included()->sync($includedIds);
                        }

                        $created++;
                    }

                    $syncedVehicleIds[] = $vehicle->id;
                }

                // Delete vehicles for this group at branches that no longer have prices
                $pricedBranchIds = array_keys($branchesWithPrice);
                $orphanedBranchVehicles = Vehicle::where('description', 'LIKE', '%[JIMPI-GROUP-ID:' . $groupId . ']%')
                    ->whereNotIn('pickup_loc', $pricedBranchIds)
                    ->get();

                foreach ($orphanedBranchVehicles as $obv) {
                    $this->deleteVehicle($obv);
                    $deleted++;
                }
            } catch (\Exception $e) {
                $failed++;
                $this->error("Failed group {$groupId}: " . $e->getMessage());
            }
        }

        // ------------------------------------------------------------------
        // 8. Delete orphaned Jimpisoft vehicles no longer in the API
        // ------------------------------------------------------------------
        if (! $pricesOnly && ! empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('description', 'LIKE', '%[JIMPI-GROUP-ID:%')
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
        // 10. Summary
        // ------------------------------------------------------------------
        $this->newLine();
        $this->info('========== Sync Complete ==========');
        $this->info("Created     : {$created}");
        $this->info("Updated     : {$updated}");
        $this->info("Deleted     : {$deleted}");
        $this->info("Failed      : {$failed}");
        if ($branchesDeleted > 0) {
            $this->info("Empty branches deleted: {$branchesDeleted}");
        }
        $this->info('===================================');

        return self::SUCCESS;
    }

    /* ---------------------------------------------------------------------- */
    /*  Private helpers                                                       */
    /* ---------------------------------------------------------------------- */

    /**
     * Delete a vehicle and all its related records.
     *
     * @param Vehicle $vehicle
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
     * Delete old VehicleSpecification records and insert new ones
     * mapped from Jimpisoft group details.
     *
     * @param Vehicle $vehicle
     * @param array<string, mixed> $details
     */
    private function syncVehicleSpecifications(Vehicle $vehicle, array $details): void
    {
        // Delete existing specs for this vehicle
        VehicleSpecification::query()->where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

        // --- Doors ---
        $doors = $details['doors'] ?? null;
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
        $seats = $details['seats'] ?? null;
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

        // --- Transmission ---
        $autoTransmission = filter_var(
            $details['automaticTransmission'] ?? $details['AutomaticTransmission'] ?? false,
            FILTER_VALIDATE_BOOLEAN
        );
        if (isset($this->specDefinitions['Transmission'])) {
            $transValue = $autoTransmission ? 'Automatic Transmission' : 'Manual Transmission';
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transValue,
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Suitcase (map numeric count to size category) ---
        $suitcases = $details['suitcases'] ?? null;
        if ($suitcases !== null && $suitcases !== '' && isset($this->specDefinitions['Suitcase'])) {
            $suitValue = $this->mapSuitcaseCount((int) $suitcases);
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
            $acValue = $acOptions[0] ?? 'cool & Heat';
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
        $fuelId = $details['fuel'] ?? $details['Fuel'] ?? null;
        if ($fuelId !== null && $fuelId !== '' && isset($this->specDefinitions['Fuel'])) {
            // Options in DB: ["Petrol","Gas","Electric","Hybrid Petrol & Gas","Hybrid Gas & Petrol"]
            $fuelType = 'Petrol'; 
            if ($fuelId == 3) {
                $fuelType = 'Electric';
            } elseif ($fuelId == 4) {
                $fuelType = 'Hybrid Petrol & Gas';
            } elseif ($fuelId == 2) {
                // Jimpisoft '2' is often Petrol for standard cars like Kia Rio.
                // If it's meant to be Diesel, the DB doesn't have a 'Diesel' option, so 'Gas' or 'Petrol' is the closest.
                $fuelType = 'Petrol'; 
            }
            
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
     * Resolve the local category ID for a Jimpisoft group.
     *
     * Uses the ACRISS-style first letter of the group code to determine
     * the vehicle class, then maps it to the matching local category.
     * Falls back to "Economy" (id 5) when no match is found.
     *
     * @param string $groupId   e.g. "B1", "C1", "X18", "A16"
     * @param array  $details   Group details from the API
     * @return int
     */
    private function resolveCategory(string $groupId, ?array $details = null): int
    {
        // ACRISS first-letter to local category name mapping
        // M = Mini, A = Mini/Economy, B = Economy, C = Compact/Standard,
        // D = Standard, E/H = Full Size, F/G = Full Size/SUV,
        // I/J/S = SUV/Compact SUV, L/W = Luxury, R/X/P = SUV/Special,
        // K/V = Minivan
        $acrissMap = [
            'M' => 'Mini',
            'A' => 'Economy',
            'B' => 'Economy',
            'C' => 'Standard',
            'D' => 'Standard',
            'E' => 'Full Size',
            'H' => 'Full Size',
            'F' => 'Full Size',
            'G' => 'Full Size',
            'I' => 'Compact SUV',
            'J' => 'Compact SUV',
            'S' => 'SUV',
            'R' => 'SUV',
            'X' => 'SUV',
            'P' => 'SUV',
            'L' => 'Luxury',
            'W' => 'Luxury',
            'K' => 'Minivan',
            'V' => 'Minivan',
            'N' => 'Small',
            'O' => 'Small',
        ];

        $firstLetter = strtoupper(substr($groupId, 0, 1));
        $categoryName = $acrissMap[$firstLetter] ?? null;

        // If not matched by prefix, try the details' vehicleType / className
        if ($categoryName === null && !empty($details)) {
            $type = strtolower(trim($details['vehicleType'] ?? $details['VehicleType'] ?? $details['className'] ?? ''));
            foreach (['mini', 'economy', 'compact suv', 'suv', 'standard', 'full size', 'luxury', 'minivan', 'small'] as $cat) {
                if (str_contains($type, $cat)) {
                    $categoryName = ucwords($cat);
                    break;
                }
            }
        }

        // Look up the category ID from the DB
        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        // Fallback: use "Economy" (id 5)
        $fallback = \App\Models\Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : \App\Models\Category::first()->id;
    }

    /**
     * Map a numeric suitcase count to the local size category.
     *
     * @param int $count
     * @return string
     */
    private function mapSuitcaseCount(int $count): string
    {
        if ($count <= 1) {
            return 'Small';
        }
        if ($count <= 3) {
            return 'Medium';
        }
        return 'large';
    }

    /**
     * Download an external image and save it to public/img/vehicles/.
     * Handles both direct image URLs and HTML gallery pages (postimg.cc, etc.).
     *
     * @param string|null $url
     * @param string $groupId
     * @return string|null  Local filename or null on failure
     */
    private function downloadImage(?string $url, string $groupId): ?string
    {
        if (empty($url)) {
            return null;
        }

        // If it's already a local filename (no protocol), keep it
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            return $url;
        }

        try {
            $imageUrl = $this->resolveImageUrl($url);

            if (empty($imageUrl)) {
                return null;
            }

            $response = Http::timeout(30)->withOptions(['verify' => false])->get($imageUrl);

            if (! $response->successful()) {
                Log::warning("Jimpisoft image download failed (HTTP {$response->status()})", ['url' => $imageUrl]);
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $body = $response->body();

            if (! str_starts_with($contentType, 'image/')) {
                Log::warning("Jimpisoft resolved URL did not return an image", [
                    'url' => $imageUrl,
                    'content_type' => $contentType,
                ]);
                return null;
            }

            // Determine extension
            $extension = 'jpg';
            $mimeTypes = new MimeTypes();
            $extensions = $mimeTypes->getExtensions(strtok($contentType, ';'));
            if (! empty($extensions)) {
                $extension = $extensions[0];
            }

            // Deterministic filename so re-runs overwrite the same file instead of creating duplicates
            $filename = 'jimpisoft_' . Str::slug($groupId) . '.' . $extension;
            $directory = public_path('img/vehicles');

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;
            file_put_contents($fullPath, $body);

            return $filename;
        } catch (\Exception $e) {
            Log::warning("Jimpisoft image download exception", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }



    /**
     * Resolve a gallery page URL to a direct image URL.
     *
     * @param string $url
     * @return string|null
     */
    private function resolveImageUrl(string $url): ?string
    {
        try {
            $response = Http::timeout(30)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';

            // Already a direct image
            if (str_starts_with($contentType, 'image/')) {
                return $url;
            }

            $body = $response->body();

            // Strategy 1: og:image meta tag
            if (preg_match('/<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']/', $body, $m)) {
                return $m[1];
            }
            if (preg_match('/<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']/', $body, $m)) {
                return $m[1];
            }

            // Strategy 2: twitter:image meta tag
            if (preg_match('/<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']/', $body, $m)) {
                return $m[1];
            }

            // Strategy 3: Look for i.postimg.cc pattern in the HTML
            if (preg_match('/https:\/\/i\.postimg\.cc\/[^"\'\s]+/', $body, $m)) {
                return $m[0];
            }

            // Strategy 4: Look for any direct image URL in common patterns
            if (preg_match('/https?:\/\/[^"\'\s]+\.(?:jpg|jpeg|png|gif|webp)/i', $body, $m)) {
                return $m[0];
            }

            Log::warning("Could not resolve image URL from gallery page", ['url' => $url]);
            return null;
        } catch (\Exception $e) {
            Log::warning("Image URL resolution exception", ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }
}
