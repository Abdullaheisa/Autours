<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Included;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\SurpriceApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;

class SyncSurpriceVehicles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'surprice:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd), defaults to tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}
                            {--concurrency=5 : Number of concurrent API requests per batch}
                            {--timeout=30 : HTTP request timeout per API call in seconds}
                            {--rate-codes=Autours : Comma-separated list of rate codes to sync}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Surprice Mobility API into Autours. Creates one vehicle record per group per rate code per branch.';

    /**
     * Cache of Specification definitions keyed by name.
     *
     * @var array<string, array>|null
     */
    private ?array $specDefinitions = null;

    /**
     * In-memory cache of already-downloaded images in the current run.
     *
     * @var array<string, string|null>
     */
    private array $imageCache = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        ini_set('memory_limit', '512M');

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
        // 2. Load local specification definitions
        // ------------------------------------------------------------------
        $this->loadSpecificationDefinitions();

        // ------------------------------------------------------------------
        // 3. Resolve all Surprice branches
        // ------------------------------------------------------------------
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->orderBy('city')
            ->orderBy('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Surprice branches found. Run: php artisan surprice:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // ------------------------------------------------------------------
        // 4. Resolve dates and rate codes
        // ------------------------------------------------------------------
        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addMonth()->format('Y-m-d');
        $pickupDateTime = $pickupDate . 'T10:00:00';
        $dropoffDateTime1 = Carbon::parse($pickupDate)->addDay()->format('Y-m-d\T10:00:00');
        $dropoffDateTime7 = Carbon::parse($pickupDate)->addDays(7)->format('Y-m-d\T10:00:00');
        $dropoffDateTime30 = Carbon::parse($pickupDate)->addDays(30)->format('Y-m-d\T10:00:00');

        $rateCodesInput = $this->option('rate-codes');
        $rateCodes = array_filter(array_map('trim', explode(',', $rateCodesInput)));

        $this->info("Using pickup: {$pickupDateTime}");
        $this->info('Rate codes: ' . implode(', ', $rateCodes));

        $pricesOnly = $this->option('prices-only');
        $concurrency = (int) $this->option('concurrency');
        if ($concurrency < 1) {
            $concurrency = 10;
        }

        $timeout = (int) $this->option('timeout');
        if ($timeout >= 1) {
            $service->setTimeout($timeout);
        }

        // ------------------------------------------------------------------
        // 5. Build station_id => branch_id map
        // ------------------------------------------------------------------
        $stationToBranchMap = [];
        foreach ($allBranches as $branch) {
            $stationToBranchMap[$branch->station_id] = $branch->id;
        }

        // ------------------------------------------------------------------
        // 6. Pre-load existing Surprice vehicles from DB
        // ------------------------------------------------------------------
        $allExistingSurpriceVehicles = Vehicle::where('description', 'LIKE', '%[SURPRICE-GROUP-ID:%')
            ->get();

        $existingVehiclesByTag = [];
        foreach ($allExistingSurpriceVehicles as $v) {
            if (preg_match('/\[SURPRICE-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                $existingVehiclesByTag[$m[1]][$v->pickup_loc] = $v;
            }
        }

        $this->info('Existing Surprice vehicles in DB: ' . $allExistingSurpriceVehicles->count());

        // ------------------------------------------------------------------
        // 7. Process each rate code independently to keep memory low
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $deleted = 0;
        $failed = 0;
        $syncedVehicleIds = [];
        $allPricedBranchIds = [];

        foreach ($rateCodes as $rateCode) {
            $this->info("Processing rate code: {$rateCode}...");

            // 7a. Fetch 1-day availability
            $this->info('  Fetching 1-day prices...');
            $progress1 = $this->output->createProgressBar(count($stationToBranchMap));
            $progress1->start();
            $availability1 = $service->getAvailabilityForStations(
                $stationToBranchMap,
                $pickupDateTime,
                $dropoffDateTime1,
                30,
                $rateCode,
                $concurrency,
                function (int $processed) use ($progress1) {
                    $progress1->advance($processed);
                }
            );
            $progress1->finish();
            $this->newLine();

            // 7b. Fetch 7-day availability
            $this->info('  Fetching 7-day prices...');
            $progress7 = $this->output->createProgressBar(count($stationToBranchMap));
            $progress7->start();
            $availability7 = $service->getAvailabilityForStations(
                $stationToBranchMap,
                $pickupDateTime,
                $dropoffDateTime7,
                30,
                $rateCode,
                $concurrency,
                function (int $processed) use ($progress7) {
                    $progress7->advance($processed);
                }
            );
            $progress7->finish();
            $this->newLine();

            // 7c. Fetch 30-day availability
            $this->info('  Fetching 30-day prices...');
            $progress30 = $this->output->createProgressBar(count($stationToBranchMap));
            $progress30->start();
            $availability30 = $service->getAvailabilityForStations(
                $stationToBranchMap,
                $pickupDateTime,
                $dropoffDateTime30,
                30,
                $rateCode,
                $concurrency,
                function (int $processed) use ($progress30) {
                    $progress30->advance($processed);
                }
            );
            $progress30->finish();
            $this->newLine();

            // 7d. Build compact price structure and immediately create/update vehicles
            $ratePricedBranchIds = [];

            foreach ($stationToBranchMap as $stationId => $branchId) {
                $data1 = $availability1[$branchId] ?? [];
                $data7 = $availability7[$branchId] ?? [];
                $data30 = $availability30[$branchId] ?? [];

                $offerings1 = $data1['productOfferings'] ?? [];
                $offerings7 = $data7['productOfferings'] ?? [];
                $offerings30 = $data30['productOfferings'] ?? [];

                $prices = [];

                foreach ($offerings1 as $offering) {
                    $groupId = (string) ($offering['vehicle']['code'] ?? '');
                    if (empty($groupId)) {
                        continue;
                    }

                    $charge = $this->findMainCharge($offering);
                    $totalCharge = $offering['rentalDetails'][0]['totalCharge'] ?? [];

                    $dayPrice = $charge['unitCharge'] ?? 0;
                    $currency = $charge['currencyCode'] ?? ($totalCharge['currencyCode'] ?? 'EUR');

                    if ($dayPrice > 0) {
                        $prices[$groupId] = [
                            'day_price' => (float) $dayPrice,
                            'currency' => $currency,
                            'vehicle' => $offering['vehicle'],
                            'insurance' => $offering['rentalDetails'][0]['rentalRate']['insurance'] ?? null,
                            'vendor_rate_id' => $offering['rentalDetails'][0]['rentalRate']['rateQualifier']['vendorRateID'] ?? null,
                        ];
                    }
                }

                foreach ($offerings7 as $offering) {
                    $groupId = (string) ($offering['vehicle']['code'] ?? '');
                    if (empty($groupId) || !isset($prices[$groupId])) {
                        continue;
                    }
                    $charge = $this->findMainCharge($offering);
                    $unitCharge = $charge['unitCharge'] ?? 0;
                    if ($unitCharge > 0) {
                        $prices[$groupId]['week_price'] = round((float) $unitCharge * 7, 2);
                    }
                }

                foreach ($offerings30 as $offering) {
                    $groupId = (string) ($offering['vehicle']['code'] ?? '');
                    if (empty($groupId) || !isset($prices[$groupId])) {
                        continue;
                    }
                    $charge = $this->findMainCharge($offering);
                    $unitCharge = $charge['unitCharge'] ?? 0;
                    $totalAmount = $offering['rentalDetails'][0]['totalCharge']['estimatedTotalAmount'] ?? 0;
                    if ($unitCharge > 0) {
                        $prices[$groupId]['month_price'] = round((float) $unitCharge * 30, 2);
                    } elseif ($totalAmount > 0) {
                        $prices[$groupId]['month_price'] = (float) $totalAmount;
                    }
                }

                if (empty($prices)) {
                    continue;
                }

                $ratePricedBranchIds[] = $branchId;
                $allPricedBranchIds[$branchId] = true;
                $branch = $allBranches->firstWhere('id', $branchId);

                if (! $branch) {
                    continue;
                }

                foreach ($prices as $groupId => $priceData) {
                    $tag = "[SURPRICE-GROUP-ID:{$groupId}|RATE:{$rateCode}]";
                    $existingVehicle = $existingVehiclesByTag["{$groupId}|RATE:{$rateCode}"][$branchId] ?? null;

                    $vehicleInfo = $priceData['vehicle'];
                    $vehicleName = trim($vehicleInfo['description'] ?? $vehicleInfo['vehMakeModel'] ?? $groupId);
                    $photoUrl = $vehicleInfo['pictureURL'] ?? null;

                    $dayPrice = $priceData['day_price'];
                    $weekPrice = $priceData['week_price'] ?? round($dayPrice * 7, 2);
                    $monthPrice = $priceData['month_price'] ?? round($dayPrice * 30, 2);
                    $currency = $priceData['currency'];

                    // Currency conversion if branch currency differs
                    $branchCurrency = $branch->currency;
                    if (!empty($currency) && !empty($branchCurrency) && $currency !== $branchCurrency) {
                        $rate = \App\Models\CurrencyRate::where('currency_from', $currency)
                            ->where('currency_to', $branchCurrency)
                            ->first();
                        if ($rate) {
                            $dayPrice = round($dayPrice * $rate->rate, 2);
                            $weekPrice = round($weekPrice * $rate->rate, 2);
                            $monthPrice = round($monthPrice * $rate->rate, 2);
                            $currency = $branchCurrency;
                        }
                    }

                    // Extract inclusions
                    $inclusions = [];
                    $insurance = $priceData['insurance'] ?? null;
                    if (!empty($insurance)) {
                        $inclusions[] = $insurance['detailedDescription'] ?? $insurance['description'] ?? 'Insurance';
                    }
                    if (!empty($vehicleInfo['airConditionInd'])) {
                        $inclusions[] = 'Air Conditioning';
                    }
                    if (!empty($vehicleInfo['unlimitedMileage'])) {
                        $inclusions[] = 'Unlimited Mileage';
                    }

                    if ($pricesOnly && ! $existingVehicle) {
                        continue;
                    }

                    if ($existingVehicle) {
                        $vehicle = $existingVehicle;
                        $updateData = [
                            'price' => $dayPrice,
                            'week_price' => $weekPrice,
                            'month_price' => $monthPrice,
                            'activation' => true,
                        ];
                        if ($vehicle->supplier != $supplierUser->id) {
                            $updateData['supplier'] = $supplierUser->id;
                        }
                        if (empty($vehicle->photo) && !empty($photoUrl)) {
                            $photoFilename = $this->downloadImage($photoUrl, $groupId);
                            if ($photoFilename) {
                                $updateData['photo'] = $photoFilename;
                            }
                        }
                        $vehicle->update($updateData);

                        if (!empty($inclusions)) {
                            $this->syncInclusions($vehicle, $inclusions);
                        }

                        $specCount = VehicleSpecification::where('vehicle_id', $vehicle->id)->count();
                        if (! $pricesOnly && $specCount < 4) {
                            $this->syncVehicleSpecifications($vehicle, $vehicleInfo);
                        }

                        $updated++;
                    } else {
                        if ($pricesOnly) {
                            continue;
                        }

                        $photoFilename = $this->downloadImage($photoUrl, $groupId);
                        $categoryId = $this->resolveCategoryFromSipp($vehicleInfo['code'] ?? '');

                        $vehicle = Vehicle::create([
                            'name' => $vehicleName,
                            'description' => $tag . ' ' . ($vehicleInfo['vehMakeModel'] ?? ''),
                            'photo' => $photoFilename,
                            'supplier' => $supplierUser->id,
                            'activation' => true,
                            'pickup_loc' => $branchId,
                            'category' => $categoryId,
                            'fuel_policy_id' => null,
                            'price' => $dayPrice,
                            'week_price' => $weekPrice,
                            'month_price' => $monthPrice,
                        ]);

                        \App\Models\Profit::create([
                            'vehicle_id' => $vehicle->id,
                            'supplier_id' => $supplierUser->id,
                            'branch_id' => $branchId,
                            'per_day_profit' => 10,
                            'per_week_profit' => 10,
                            'per_month_profit' => 10,
                            'weekend_profit' => 10,
                        ]);

                        $this->syncVehicleSpecifications($vehicle, $vehicleInfo);
                        $this->syncInclusions($vehicle, $inclusions);

                        $created++;
                    }

                    $syncedVehicleIds[] = $vehicle->id;
                }
            }

            // Free memory before next rate code
            unset($availability1, $availability7, $availability30);
            gc_collect_cycles();

            $this->info("  Rate code {$rateCode} complete. Branches with prices: " . count(array_unique($ratePricedBranchIds)));
        }

        $this->info('Branches with valid prices: ' . count($allPricedBranchIds));

        // ------------------------------------------------------------------
        // 8. Deactivate vehicles for branches that no longer have prices
        // ------------------------------------------------------------------
        $pricedBranchIds = array_keys($allPricedBranchIds);

        $missingBranchVehicles = Vehicle::where('description', 'LIKE', '%[SURPRICE-GROUP-ID:%')
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
            $deleted++;
        }

        // ------------------------------------------------------------------
        // 10. Delete orphaned Surprice vehicles no longer in any group
        // ------------------------------------------------------------------
        if (! $pricesOnly && ! empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('description', 'LIKE', '%[SURPRICE-GROUP-ID:%')
                ->whereNotIn('id', $syncedVehicleIds)
                ->get();

            foreach ($orphaned as $orphanedVehicle) {
                $this->deleteVehicle($orphanedVehicle);
                $deleted++;
                $this->info("Deleted orphaned: {$orphanedVehicle->name}");
            }
        }

        // ------------------------------------------------------------------
        // 11. Delete empty branches
        // ------------------------------------------------------------------
        $branchesDeleted = 0;
        if (! $pricesOnly) {
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
        }

        // ------------------------------------------------------------------
        // 12. Summary
        // ------------------------------------------------------------------
        $this->newLine();
        $this->info('========== Surprice Vehicle Sync Complete ==========');
        $this->info("Created     : {$created}");
        $this->info("Updated     : {$updated}");
        $this->info("Deactivated : {$deleted}");
        $this->info("Failed      : {$failed}");
        if ($branchesDeleted > 0) {
            $this->info("Empty branches deleted: {$branchesDeleted}");
        }
        $this->info('====================================================');

        return self::SUCCESS;
    }

    /* ---------------------------------------------------------------------- */
    /*  Private helpers                                                       */
    /* ---------------------------------------------------------------------- */

    /**
     * Find the main product cost charge from an offering's rental details.
     *
     * @param array<string, mixed> $offering
     * @return array<string, mixed>
     */
    private function findMainCharge(array $offering): array
    {
        $charges = $offering['rentalDetails'][0]['rentalRate']['vehicleCharges'] ?? [];
        foreach ($charges as $charge) {
            if (($charge['purpose'] ?? null) === 1) {
                return [
                    'amount' => $charge['amount'] ?? 0,
                    'currencyCode' => $charge['currencyCode'] ?? 'EUR',
                    'unitCharge' => $charge['calculationInfo']['unitCharge'] ?? 0,
                    'quantity' => $charge['calculationInfo']['quantity'] ?? 1,
                ];
            }
        }
        return [];
    }

    /**
     * Sync inclusions for a vehicle.
     *
     * @param Vehicle $vehicle
     * @param array<int, string> $inclusions
     */
    private function syncInclusions(Vehicle $vehicle, array $inclusions): void
    {
        $includedIds = [];
        foreach ($inclusions as $incText) {
            $inc = Included::firstOrCreate(['what_is_included' => $incText]);
            $includedIds[] = $inc->id;
        }
        $vehicle->included()->sync($includedIds);
    }

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
     * Sync vehicle specifications from Surprice vehicle data.
     */
    private function syncVehicleSpecifications(Vehicle $vehicle, array $vehicleInfo): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

        // --- Doors ---
        $doors = $vehicleInfo['doorsNum'] ?? null;
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
        $seats = $vehicleInfo['passengerQuantity'] ?? null;
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
        $transmission = (string) ($vehicleInfo['transmissionType'] ?? '');
        if (! empty($transmission) && isset($this->specDefinitions['Transmission'])) {
            $transValue = str_contains(strtolower($transmission), 'auto') ? 'Automatic Transmission' : 'Manual Transmission';
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transValue,
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // --- Suitcase ---
        $suitcases = $vehicleInfo['suitcasesNum'] ?? null;
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

        // --- Air Conditioner ---
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
        $fuelId = $vehicleInfo['sippFuelId'] ?? '';
        if (! empty($fuelId) && isset($this->specDefinitions['Fuel'])) {
            $fuelType = $this->resolveFuelType((string) $fuelId);
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
        $firstLetter = strtoupper(substr($sipp, 0, 1));

        $acrissMap = [
            'M' => 'Mini',
            'N' => 'Mini',
            'E' => 'Economy',
            'H' => 'Economy',
            'C' => 'Standard',
            'D' => 'Standard',
            'I' => 'Standard',
            'J' => 'Standard',
            'S' => 'Standard',
            'T' => 'Standard',
            'F' => 'Full Size',
            'G' => 'Full Size',
            'P' => 'Luxury',
            'U' => 'Luxury',
            'L' => 'Luxury',
            'W' => 'Luxury',
            'X' => 'SUV',
            'R' => 'SUV',
            'K' => 'Minivan',
            'V' => 'Minivan',
        ];

        $categoryName = $acrissMap[$firstLetter] ?? null;

        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        $fallback = \App\Models\Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : (\App\Models\Category::first()?->id ?? 1);
    }

    /**
     * Map suitcase count to size category.
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
     * Resolve SIPP fuel ID to local fuel type.
     */
    private function resolveFuelType(string $sippFuelId): string
    {
        return match (strtoupper($sippFuelId)) {
            'E' => 'Electric',
            'H' => 'Hybrid Petrol & Gas',
            'L' => 'Hybrid Petrol & Gas',
            'D' => 'Petrol', // Diesel not in local options, map to closest
            'F' => 'Hybrid Petrol & Gas',
            default => 'Petrol',
        };
    }

    private function downloadImage(?string $url, string $groupId): ?string
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);
        $url = str_replace(' ', '%20', $url);

        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            return $url;
        }

        $cacheKey = $groupId . '|' . $url;
        if (array_key_exists($cacheKey, $this->imageCache)) {
            return $this->imageCache[$cacheKey];
        }

        $extension = pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'surprice_' . Str::slug($groupId) . '.' . $extension;
        $directory = public_path('img/vehicles');
        $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;

        if (file_exists($fullPath) && filesize($fullPath) > 0) {
            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        }

        try {
            $response = Http::timeout(15)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                Log::warning("Surprice image download failed (HTTP {$response->status()})", ['url' => $url]);
                $this->imageCache[$cacheKey] = null;
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $body = $response->body();

            if (! str_starts_with($contentType, 'image/')) {
                Log::warning("Surprice resolved URL did not return an image", [
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

            $filename = 'surprice_' . Str::slug($groupId) . '.' . $extension;

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;
            file_put_contents($fullPath, $body);

            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        } catch (\Exception $e) {
            Log::warning("Surprice image download exception", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $this->imageCache[$cacheKey] = null;
            return null;
        }
    }
}
