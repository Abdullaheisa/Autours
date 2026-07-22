<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\RentlyApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;


use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncRentlyVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    private const COMMERCIAL_AGREEMENT_CODE = 'pod-autours'; // Change this once you have the correct code from Rently

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rently:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to 1 day after pickup}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}
                            {--countries= : Comma-separated list of countries to sync (e.g. Jordan,Morocco)}
                            {--concurrency=10 : Number of concurrent API requests per batch}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Rently Network API into Autours using AvailabilityByPlace.';

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
        // Suppress PHP 8.5 deprecations
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new RentlyApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Rently supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::where('email', 'bookings@streetrentacar.com')->first();
        if (!$supplierUser) {
            $supplierUser = User::create([
                'email' => 'bookings@streetrentacar.com',
                'name' => 'Street Supplier',
                'role' => 'active_supplier',
                'password' => Hash::make('0000'),
                'company' => 'Street Network',
            ]);
        }

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Load local specification definitions
        // ------------------------------------------------------------------
        $this->loadSpecificationDefinitions();

        // ------------------------------------------------------------------
        // 3. Resolve all Rently branches
        // ------------------------------------------------------------------
        $query = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id');

        if ($this->option('countries')) {
            $countries = array_map('trim', explode(',', $this->option('countries')));
            // Convert to uppercase for case-insensitive like matching, or just pass as is if exact
            // Since we know the DB has mixed case, we'll do whereIn for all cases
            $allCases = [];
            foreach ($countries as $c) {
                $allCases[] = $c;
                $allCases[] = strtoupper($c);
                $allCases[] = ucfirst(strtolower($c));
                $allCases[] = strtolower($c);
            }
            $query->whereIn('country', array_unique($allCases));
        }

        $allBranches = $query->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Rently branches found. Run: php artisan rently:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // Resolve dates (at least 24h lead time)
        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addDays(2)->format('Y-m-d 10:00');
        // Use 3 days for the initial fetch to bypass branches with minimum rental days (e.g. Morocco requires 2 days)
        $dropoffDate3 = Carbon::parse($pickupDate)->addDays(3)->format('Y-m-d 10:00');
        $dropoffDate7 = Carbon::parse($pickupDate)->addDays(7)->format('Y-m-d 10:00');
        $dropoffDate30 = Carbon::parse($pickupDate)->addDays(30)->format('Y-m-d 10:00');

        $this->info("Using pickup: {$pickupDate}");

        // ------------------------------------------------------------------
        // 4. Fetch availability for ALL branches concurrently
        // ------------------------------------------------------------------
        $concurrency = (int) $this->option('concurrency');
        $token = $service->getToken();
        if (!$token) {
            $this->error('Failed to obtain Rently API token.');
            return self::FAILURE;
        }

        $this->info("Fetching availability for {$allBranches->count()} branch(es)...");
        
        $stationPrices = [];
        $branchModels = []; // To store model details from availability

        foreach ([$dropoffDate3, $dropoffDate7, $dropoffDate30] as $idx => $dropDate) {
            $days = [3, 7, 30][$idx];
            $this->info("Fetching {$days}-day prices...");
            
            $progress = $this->output->createProgressBar($allBranches->count());
            $progress->start();

            foreach ($allBranches->chunk($concurrency) as $chunk) {
                $responses = Http::pool(fn (Pool $pool) => 
                    $chunk->each(fn ($branch) => 
                        $pool->as((string) $branch->id)
                            ->withoutVerifying()
                            ->withToken($token)
                            ->timeout(60)
                            ->get('https://api.rentlynetwork.com/api/AvailabilityByPlace', [
                                'DeliveryLocation' => (int) $branch->station_id,
                                'DropoffLocation' => (int) $branch->station_id,
                                'From' => $pickupDate,
                                'To' => $dropDate,
                                'DriverAge' => 25,
                                'CommercialAgreementCode' => self::COMMERCIAL_AGREEMENT_CODE,
                            ])
                    )
                );

                foreach ($responses as $branchId => $response) {
                    if ($response instanceof \Illuminate\Http\Client\Response && $response->successful()) {
                        $items = $response->json();
                        if (empty($items)) {
                            Log::info("Rently API: No vehicles returned for branch {$branchId}", [
                                'pickup' => $pickupDate,
                                'dropoff' => $dropDate,
                                'agreement' => self::COMMERCIAL_AGREEMENT_CODE
                            ]);
                        }
                        foreach ($items as $item) {
                            $modelId = (string) ($item['model']['id'] ?? '');
                            if (empty($modelId)) continue;

                            $price = (float) ($item['price'] ?? 0);
                            $dayPrice = $price / $days;

                            if ($days === 3) {
                                $stationPrices[$branchId][$modelId]['day_value'] = $dayPrice;
                                $stationPrices[$branchId][$modelId]['currency'] = $item['currency'] ?? 'USD';
                                $branchModels[$modelId] = $item['model'];
                            } elseif ($days === 7) {
                                $stationPrices[$branchId][$modelId]['week_price'] = round($price / 7, 2);
                            } elseif ($days === 30) {
                                $stationPrices[$branchId][$modelId]['month_price'] = round($price / 30, 2);
                            }
                        }
                    } else {
                        $error = $response instanceof \Illuminate\Http\Client\Response 
                            ? $response->body() 
                            : ($response instanceof \Exception ? $response->getMessage() : 'Unknown error');
                        
                        Log::error("Rently API: Availability request failed for branch {$branchId}", [
                            'status' => $response instanceof \Illuminate\Http\Client\Response ? $response->status() : 'N/A',
                            'error' => $error,
                            'agreement' => self::COMMERCIAL_AGREEMENT_CODE
                        ]);
                    }
                    $progress->advance();
                }
            }
            $progress->finish();
            $this->newLine();
        }

        // ------------------------------------------------------------------
        // 5. Create/Update Vehicles
        // ------------------------------------------------------------------
        $pricesOnly = $this->option('prices-only');
        $created = 0;
        $updated = 0;
        $deleted = 0;
        $syncedVehicleIds = [];

        $branchesKeyed = $allBranches->keyBy('id');

        foreach ($stationPrices as $branchId => $models) {
            $branch = $branchesKeyed->get($branchId);
            $branchCurrency = $branch?->currency;

            foreach ($models as $modelId => $priceData) {
                $dayPrice = $priceData['day_value'] ?? 0;
                if ($dayPrice <= 0) continue;

                $weekPrice = $priceData['week_price'] ?? $dayPrice;
                $monthPrice = $priceData['month_price'] ?? $dayPrice;
                $apiCurrency = $priceData['currency'] ?? 'USD';

                if (!empty($apiCurrency) && !empty($branchCurrency) && $apiCurrency !== $branchCurrency) {
                    $rate = \App\Models\CurrencyRate::where('currency_from', $apiCurrency)
                        ->where('currency_to', $branchCurrency)
                        ->first();
                    if ($rate && $rate->rate > 0) {
                        $dayPrice = round($dayPrice * $rate->rate, 2);
                        $weekPrice = round($weekPrice * $rate->rate, 2);
                        $monthPrice = round($monthPrice * $rate->rate, 2);
                    }
                }

                $model = $branchModels[$modelId];
                $vehicleName = trim(($model['brand'] ?? '') . ' ' . ($model['name'] ?? ''));
                if (empty($vehicleName)) $vehicleName = 'Rently Model ' . $modelId;
                $vehicleName = $this->normalizeVehicleName($vehicleName);

                $sipp = (string) ($model['sipp'] ?? '');
                $transValue = $sipp ? \App\Services\SippDecoder::getLocalTransmissionName($sipp) : (($model['transmissionType'] ?? '') === 'Automatic' ? 'Automatic' : 'Manual');
                if (stripos($vehicleName, 'Automatic') === false && stripos($vehicleName, 'Manual') === false) {
                    $vehicleName .= ' ' . $transValue;
                }

                $categoryId = $this->resolveCategoryFromSipp($sipp);

                $existingVehicle = Vehicle::where('pickup_loc', $branchId)
                    ->where('description', 'LIKE', "%[RENTLY-MODEL-ID:{$modelId}]%")
                    ->first();

                if ($existingVehicle) {
                    $existingVehicle->update([
                        'name' => $vehicleName,
                        'category' => $categoryId,
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'activation' => true,
                        'instant_confirmation' => 1,
                    ]);
                    $syncedVehicleIds[] = $existingVehicle->id;
                    $updated++;
                } elseif (!$pricesOnly) {
                    $photoFilename = $this->resolveLocalPhoto($vehicleName);
                    
                    $vehicle = Vehicle::create([
                        'name' => $vehicleName,
                        'description' => "[RENTLY-MODEL-ID:{$modelId}] " . ($model['description'] ?? ''),
                        'photo' => $photoFilename,
                        'supplier' => $supplierUser->id,
                        'activation' => true,
                        'pickup_loc' => $branchId,
                        'category' => $categoryId,
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'instant_confirmation' => 1,
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

                    $this->syncVehicleSpecifications($vehicle, $model);
                    $syncedVehicleIds[] = $vehicle->id;
                    $created++;
                }
            }
        }

        // Delete vehicles not seen in this sync
        if (! $pricesOnly && ! empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('supplier', $supplierUser->id)
                ->whereNotIn('id', $syncedVehicleIds)
                ->get();

            foreach ($orphaned as $ov) {
                $ov->delete();
                $deleted++;
            }
        }

        // Clean up branches without vehicles
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

        $this->newLine();
        $this->info('========== Rently Vehicle Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        if ($branchesDeleted > 0) {
            $this->info("Empty branches deleted: {$branchesDeleted}");
        }
        $this->info('==================================================');

        return self::SUCCESS;
    }

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

    private function syncVehicleSpecifications(Vehicle $vehicle, array $model): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();
        $records = [];
        $now = now()->toDateTimeString();

        if (isset($model['doors']) && isset($this->specDefinitions['Doors'])) {
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Doors', 'value' => (string)$model['doors'], 'icon' => $this->specDefinitions['Doors']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        if (isset($model['passangers']) && isset($this->specDefinitions['Number of seats'])) {
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Number of seats', 'value' => (string)$model['passangers'], 'icon' => $this->specDefinitions['Number of seats']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        $sipp = (string) ($model['sipp'] ?? '');

        if (isset($this->specDefinitions['Transmission'])) {
            $val = $sipp ? \App\Services\SippDecoder::getLocalTransmissionName($sipp) : (($model['transmissionType'] ?? '') === 'Automatic' ? 'Automatic' : 'Manual');
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Transmission', 'value' => $val, 'icon' => $this->specDefinitions['Transmission']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        if (isset($this->specDefinitions['Air Conditioner'])) {
            $val = $sipp ? \App\Services\SippDecoder::getLocalAcName($sipp) : (($model['hasAirCondition'] ?? true) ? 'Air Conditioning' : 'No AC');
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Air Conditioner', 'value' => $val, 'icon' => $this->specDefinitions['Air Conditioner']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        $totalBags = ($model['bigLuggage'] ?? 0) + ($model['smallLuggage'] ?? 0);
        if ($totalBags > 0 && isset($this->specDefinitions['Suitcase'])) {
            $val = $totalBags <= 2 ? 'Small' : ($totalBags <= 4 ? 'Medium' : 'large');
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Suitcase', 'value' => $val, 'icon' => $this->specDefinitions['Suitcase']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        if (isset($this->specDefinitions['Fuel'])) {
            $val = $sipp ? \App\Services\SippDecoder::getLocalFuelName($sipp) : 'Petrol';
            $records[] = ['vehicle_id' => $vehicle->id, 'name' => 'Fuel', 'value' => $val, 'icon' => $this->specDefinitions['Fuel']['icon'], 'created_at' => $now, 'updated_at' => $now];
        }

        if (!empty($records)) {
            VehicleSpecification::insert($records);
        }
    }

    private function resolveCategoryFromSipp(string $sipp): int
    {
        $categoryName = \App\Services\SippDecoder::getLocalCategoryName($sipp);
        $category = \App\Models\Category::where('name', $categoryName)->first();
        return $category ? $category->id : (\App\Models\Category::first()?->id ?? 1);
    }


}
