<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Included;
use App\Models\Profit;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\RoutesApiService;
use App\Services\SippDecoder;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Console\Commands\Traits\NormalizesVehicleNames;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;

class SyncRoutesVehicles extends Command
{
    use NormalizesVehicleNames, ResolvesLocalVehiclePhoto;

    private array $imageCache = [];
    private array $specDefinitions = [];

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'routes:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd), defaults to day-after-tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}
                            {--rate-codes=Domestic : Comma-separated list of rate codes to sync}
                            {--concurrency=10 : Number of concurrent API requests per batch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Routes API into Autours. Creates one vehicle record per branch.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        ini_set('memory_limit', '512M');

        $service = new RoutesApiService();

        // ------------------------------------------------------------------
        // 1. Resolve supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::where('email', 'tsingh@routes.ca')->first();
        if (!$supplierUser) {
            $this->error('Routes supplier user not found. Run routes:sync-branches first.');
            return self::FAILURE;
        }

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Load spec definitions
        // ------------------------------------------------------------------
        $this->loadSpecificationDefinitions();

        // ------------------------------------------------------------------
        // 3. Resolve all Routes branches
        // ------------------------------------------------------------------
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Routes branches found. Run: php artisan routes:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // Resolve dates
        $pickupStr = $this->option('pickup-date');
        $pickupDateCarbon = $pickupStr ? Carbon::parse($pickupStr) : Carbon::now()->addDays(2)->startOfDay()->addHours(10);

        if ($pickupDateCarbon <= Carbon::today()) {
            $this->error('Pickup date must be in the future.');
            return self::FAILURE;
        }

        $dropoffDate3  = $pickupDateCarbon->copy()->addDays(3);
        $dropoffDate7  = $pickupDateCarbon->copy()->addDays(7);
        $dropoffDate30 = $pickupDateCarbon->copy()->addDays(30);

        $this->info("Using pickup: {$pickupDateCarbon->format('Y-m-d H:i')}");

        // ------------------------------------------------------------------
        // 4. Fetch rates for ALL branches with progress bars
        // ------------------------------------------------------------------
        $concurrency = (int) $this->option('concurrency');
        $pricesOnly  = $this->option('prices-only');

        // Global inclusions have been removed to handle them dynamically per vehicle.

        // Collect per-branch, per-classCode merged prices
        $stationPrices = [];
        $classModels   = []; // classCode => rate data (model name, seats, image)

        $this->info("Fetching availability for {$allBranches->count()} branch(es)...");

        foreach ([$dropoffDate3, $dropoffDate7, $dropoffDate30] as $idx => $dropDate) {
            $days = [3, 7, 30][$idx];
            $this->info("Fetching {$days}-day prices...");

            $progress = $this->output->createProgressBar($allBranches->count());
            $progress->start();

            foreach ($allBranches->chunk($concurrency) as $chunk) {
                foreach ($chunk as $branch) {
                    $rates = $service->getRates($branch->station_id, $pickupDateCarbon, $dropDate) ?: [];

                    foreach ($rates as $rate) {
                        $classCode = $rate['ClassCode'] ?? null;
                        if (!$classCode) continue;

                        $priceStr = (string) ($rate['TotalCharge'] ?? $rate['RateAmount'] ?? 0);
                        $price = (float) str_replace(',', '', $priceStr);
                        if ($price <= 0) continue;

                        $dayPrice = round($price / $days, 2);

                        if ($days === 3) {
                            $stationPrices[$branch->id][$classCode]['day_value'] = $dayPrice;
                            $classModels[$classCode] = [
                                'model'      => $rate['ModelDesc'] ?? '',
                                'classDesc'  => $rate['ClassDesc'] ?? '',
                                'classImage' => $rate['ClassImage'] ?? null,
                                'seats'      => $rate['Seats'] ?? null,
                                'FreeMiles'  => $rate['FreeMiles'] ?? null,
                                'MileageUnit'=> $rate['MileageUnit'] ?? 'KM',
                            ];
                        } elseif ($days === 7) {
                            $stationPrices[$branch->id][$classCode]['week_price'] = $dayPrice;
                        } elseif ($days === 30) {
                            $stationPrices[$branch->id][$classCode]['month_price'] = $dayPrice;
                        }
                    }

                    $progress->advance();
                }
            }

            $progress->finish();
            $this->newLine();
        }

        // ------------------------------------------------------------------
        // 5. Create / Update Vehicles
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;
        $deleted = 0;
        $syncedVehicleIds = [];

        foreach ($stationPrices as $branchId => $classes) {
            foreach ($classes as $classCode => $priceData) {
                $dayPrice = $priceData['day_value'] ?? 0;
                if ($dayPrice <= 0) continue;

                $weekPrice  = $priceData['week_price'] ?? $dayPrice;
                $monthPrice = $priceData['month_price'] ?? $dayPrice;

                $model = $classModels[$classCode] ?? null;
                if (!$model || empty($model['model'])) continue;

                $normalizedModel = $this->normalizeVehicleName($model['model']);
                $categoryId = $this->resolveCategoryFromSipp($classCode);

                // Add Transmission
                $transmissionRaw = SippDecoder::getTransmissionAndDrive($classCode[2] ?? '');
                $isAuto = str_contains(strtolower($transmissionRaw), 'automatic');
                $isManual = str_contains(strtolower($transmissionRaw), 'manual');

                if ($isAuto && !preg_match('/\b(Automatic|Auto|Aut)\b/i', $normalizedModel)) {
                    $normalizedModel .= ' Automatic';
                } elseif ($isManual && !preg_match('/\b(Manual|Man)\b/i', $normalizedModel)) {
                    $normalizedModel .= ' Manual';
                }

                // Check if vehicle already exists
                $existingVehicle = Vehicle::where('supplier', $supplierUser->id)
                    ->where('pickup_loc', $branchId)
                    ->where('name', $normalizedModel)
                    ->first();

                // Calculate per-vehicle inclusions
                $vehicleInclusions = [];
                $taxesIncluded = Included::firstOrCreate(['what_is_included' => 'Airport surcharges and local taxes']);
                $vehicleInclusions[] = $taxesIncluded->id;
                
                if (isset($model['FreeMiles']) && $model['FreeMiles'] !== '' && strtolower((string)$model['FreeMiles']) !== 'unlimited') {
                    // Extract numeric part if it contains text
                    preg_match('/(\d+)/', (string)$model['FreeMiles'], $matches);
                    $numericLimit = $matches[1] ?? $model['FreeMiles'];
                    
                    if (is_numeric($numericLimit)) {
                        $unit = strtoupper($model['MileageUnit'] ?? 'KM');
                        if (str_starts_with($unit, 'MI')) {
                            $numericLimit = (int) round((float)$numericLimit * 1.60934);
                        }
                    }

                    $mileageIncluded = Included::firstOrCreate(['what_is_included' => "Mileage Limit: {$numericLimit} km"]);
                } else {
                    $mileageIncluded = Included::firstOrCreate(['what_is_included' => 'Unlimited Mileage']);
                }
                $vehicleInclusions[] = $mileageIncluded->id;

                if ($existingVehicle) {
                    $existingVehicle->update([
                        'category'             => $categoryId,
                        'price'                => $dayPrice,
                        'week_price'           => $weekPrice,
                        'month_price'          => $monthPrice,
                        'activation'           => true,
                        'instant_confirmation' => 1,
                    ]);
                    // Update Inclusions for existing vehicle
                    $existingVehicle->included()->syncWithoutDetaching($vehicleInclusions);

                    $syncedVehicleIds[] = $existingVehicle->id;
                    $updated++;
                } elseif (!$pricesOnly) {
                    $photoFilename = $this->resolveLocalPhoto($normalizedModel);

                    $vehicle = Vehicle::create([
                        'name'                 => $normalizedModel,
                        'photo'                => $photoFilename,
                        'supplier'             => $supplierUser->id,
                        'activation'           => true,
                        'pickup_loc'           => $branchId,
                        'category'             => $categoryId,
                        'price'                => $dayPrice,
                        'week_price'           => $weekPrice,
                        'month_price'          => $monthPrice,
                        'instant_confirmation' => 1,
                    ]);

                    Profit::create([
                        'vehicle_id'       => $vehicle->id,
                        'supplier_id'      => $supplierUser->id,
                        'branch_id'        => $branchId,
                        'per_day_profit'   => 5,
                        'per_week_profit'  => 5,
                        'per_month_profit' => 5,
                        'weekend_profit'   => 5,
                    ]);

                    $this->syncVehicleSpecifications($vehicle, $classCode, $model['seats']);

                    // Sync Inclusions
                    $vehicle->included()->syncWithoutDetaching($vehicleInclusions);

                    $syncedVehicleIds[] = $vehicle->id;
                    $created++;
                }
            }
        }

        // ------------------------------------------------------------------
        // 6. Delete vehicles not seen in this sync
        // ------------------------------------------------------------------
        if (!$pricesOnly && !empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('supplier', $supplierUser->id)
                ->whereNotIn('id', $syncedVehicleIds)
                ->get();

            foreach ($orphaned as $ov) {
                $ov->delete();
                $deleted++;
            }
        }

        // ------------------------------------------------------------------
        // 7. Clean up branches without vehicles (orphan branches)
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
        // Summary
        // ------------------------------------------------------------------
        if ($created > 0) {
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Automated Sync Alert: {$created} new vehicle(s) have been added from Routes Supplier. Standard 5% profit margin assigned.",
                    function ($message) use ($created) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("Routes Sync Notification: {$created} New Vehicle(s) Added");
                    }
                );
            } catch (\Exception $e) {
                Log::error("Failed to send Routes new vehicle notification email: " . $e->getMessage());
            }
        }

        $this->newLine();
        $this->info('========== Routes Vehicle Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        if ($branchesDeleted > 0) {
            $this->info("Empty branches deleted: {$branchesDeleted}");
        }
        $this->info('==================================================');

        return self::SUCCESS;
    }

    private function resolveCategoryFromSipp(string $sipp): ?int
    {
        $categoryName = SippDecoder::getLocalCategoryName($sipp);
        
        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        return null;
    }

    private function loadSpecificationDefinitions(): void
    {
        $this->specDefinitions = [];
        foreach (Specification::all() as $spec) {
            $this->specDefinitions[$spec->name] = [
                'id' => $spec->id,
                'icon' => $spec->icon,
            ];
        }
    }

    private function syncVehicleSpecifications(Vehicle $vehicle, string $sipp, ?string $seats): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

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

        if (isset($this->specDefinitions['Transmission'])) {
            $transValue = SippDecoder::getLocalTransmissionName($sipp);
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transValue,
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Doors'])) {
            $bodyTypeRaw = SippDecoder::getType($sipp[1] ?? '');
            if (str_contains($bodyTypeRaw, 'Door')) {
                $doorsValue = str_replace(' Door', '', $bodyTypeRaw);
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Doors',
                    'value' => $doorsValue,
                    'icon' => $this->specDefinitions['Doors']['icon'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (isset($this->specDefinitions['Air Conditioner'])) {
            $acValue = SippDecoder::getLocalAcName($sipp);
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Air Conditioner',
                'value' => $acValue,
                'icon' => $this->specDefinitions['Air Conditioner']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Fuel'])) {
            $fuelType = SippDecoder::getLocalFuelName($sipp);
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
}
