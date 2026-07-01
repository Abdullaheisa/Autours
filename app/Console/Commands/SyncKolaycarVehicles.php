<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\KolaycarApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncKolaycarVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kolaycar:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Kolaycar (Arscar) API into Autours.';

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
        if (!$this->option('dry-run') && !$this->option('real')) {
            $this->error('You must specify either --dry-run or --real.');
            return self::FAILURE;
        }

        if ($this->option('dry-run') && $this->option('real')) {
            $this->error('You cannot specify both --dry-run and --real.');
            return self::FAILURE;
        }

        $service = new KolaycarApiService();

        // ------------------------------------------------------------------
        // 1. Resolve supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'info@arscar.com.tr'],
            [
                'name' => 'Arscar',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Arscar / Kolaycar',
            ]
        );

        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // Load spec definitions
        if ($this->specDefinitions === null) {
            $this->specDefinitions = Specification::all()->keyBy('name')->toArray();
        }

        // ------------------------------------------------------------------
        // 2. Fetch Branches for this Supplier
        // ------------------------------------------------------------------
        $branches = Branch::where('company_id', $supplierUserId)
            ->get();

        if ($branches->isEmpty()) {
            if ($this->option('dry-run')) {
                $this->warn('[DRY RUN] No branches found. Please run the sync-branches command first.');
            } else {
                $this->error('No active branches found for Arscar. Please run the sync-branches command first.');
                return self::FAILURE;
            }
        } else {
            $this->info("Found {$branches->count()} branches to process.");
        }

        // ------------------------------------------------------------------
        // 3. Process Each Branch
        // ------------------------------------------------------------------
        $hasCustomDates = $this->option('pickup-date') || $this->option('dropoff-date');
        $durations = $hasCustomDates ? [null] : [1, 7, 30];

        $totalVehiclesCreated = 0;
        $totalVehiclesUpdated = 0;

        foreach ($branches as $branch) {
            $this->info("Fetching vehicles for branch ID: {$branch->id} ({$branch->name})");
            $branchHasVehicles = false;
            $allVehiclesByTag = [];

            foreach ($durations as $days) {
                $vehicles = $this->fetchVehiclesForDuration($service, $branch, $days, $hasCustomDates);

                if (!empty($vehicles)) {
                    $branchHasVehicles = true;
                }

                foreach ($vehicles as $carData) {
                    $vehicleId = $carData['CARGROUPID'] ?? $carData['ID'] ?? $carData['VEHICLEID'] ?? null;
                    if (!$vehicleId) continue;
                    
                    $tag = "[Kolaycar-ID:{$vehicleId}]";

                    if (!isset($allVehiclesByTag[$tag])) {
                        $allVehiclesByTag[$tag] = $carData;
                        $allVehiclesByTag[$tag]['parsed_prices'] = [];
                    }

                    // Kolaycar daily price
                    $dPrice = (float) ($carData['DAILYPRICE'] ?? ($carData['TOTALPRICE'] ?? 0));
                    $daysKey = $hasCustomDates ? 1 : $days;
                    $allVehiclesByTag[$tag]['parsed_prices'][$daysKey] = $dPrice;
                }
            }

            foreach ($allVehiclesByTag as $tag => $carData) {
                if ($totalVehiclesCreated === 0 && $this->option('dry-run')) {
                    \Illuminate\Support\Facades\Log::info("Sample carData", $carData);
                }

                $vehicleName = (string) ($carData['VEHICLENAME'] ?? '');
                if (empty($vehicleName)) {
                    continue;
                }

                $sipp = (string) ($carData['SIPPCODE'] ?? '');
                $transmission = (string) ($carData['TRANSMISSIONTYPE'] ?? 'Manual');
                $fuel = (string) ($carData['FUELTYPE'] ?? 'Gasoline');
                $seats = (int) filter_var($carData['PASSENGERQUANTITY'] ?? '4', FILTER_SANITIZE_NUMBER_INT);
                $doors = str_contains(strtolower($carData['VEHICLETYPE'] ?? ''), '5') ? 5 : 4;
                
                $price1 = $carData['parsed_prices'][1] ?? null;
                $price7 = $carData['parsed_prices'][7] ?? null;
                $price30 = $carData['parsed_prices'][30] ?? null;

                // No fallback, strictly use the price available for that duration
                // If it's not available for 1 day, it gets 0.
                $dayPrice = $price1 ?? 0;
                $weekPrice = $price7 ?? 0;
                $monthPrice = $price30 ?? 0;
                
                if ($dayPrice <= 0 && $weekPrice <= 0 && $monthPrice <= 0) {
                    continue;
                }

                $image = '';
                if (empty($image) && !empty($carData['VEHICLEIMAGES'][0]['VEHICLEIMAGE'])) {
                    $image = $carData['VEHICLEIMAGES'][0]['VEHICLEIMAGE'];
                }

                $normalizedName = $this->normalizeVehicleName($vehicleName);

                $transValue = $sipp ? \App\Services\SippDecoder::getLocalTransmissionName($sipp) : ($transmission ? $this->normalizeTransmission($transmission) : 'Manual');

                if (stripos($normalizedName, 'Automatic') === false && stripos($normalizedName, 'Manual') === false) {
                    $normalizedName .= ' ' . $transValue;
                }

                $kolaycarCategory = (string) ($carData['VEHICLECATEGORY'] ?? '');
                $categoryId = $this->resolveCategoryFromSipp($sipp, $kolaycarCategory);

                if ($this->option('dry-run')) {
                    $this->line("  [DRY RUN] Would sync vehicle '{$normalizedName}' ({$sipp}) - Price: {$dayPrice} (Week: {$weekPrice}, Month: {$monthPrice})");
                    continue;
                }

                $localPhotoUrl = $this->resolveLocalPhoto($normalizedName) ?: $image;

                $vehicleId = $carData['CARGROUPID'] ?? $carData['ID'] ?? $carData['VEHICLEID'] ?? null;
                $descriptionTag = "[Kolaycar-ID:{$vehicleId}]";

                $vehicle = Vehicle::where('pickup_loc', $branch->id)
                    ->where('description', 'LIKE', "%{$descriptionTag}%")
                    ->first();

                if ($vehicle) {
                    $vehicle->update([
                        'name' => $normalizedName,
                        'category' => $categoryId,
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'photo' => $localPhotoUrl ?: $vehicle->photo,
                        'activation' => true,
                    ]);
                    $totalVehiclesUpdated++;
                } else {
                    $vehicle = Vehicle::create([
                        'name' => $normalizedName,
                        'description' => $descriptionTag . ' ' . $vehicleName,
                        'photo' => $localPhotoUrl,
                        'supplier' => $supplierUserId,
                        'activation' => true,
                        'pickup_loc' => $branch->id,
                        'category' => $categoryId,
                        'fuel_policy_id' => null,
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'instant_confirmation' => 1,
                    ]);
                    
                    \App\Models\Profit::create([
                        'vehicle_id' => $vehicle->id,
                        'supplier_id' => $supplierUserId,
                        'branch_id' => $branch->id,
                        'per_day_profit' => 0,
                        'per_week_profit' => 0,
                        'per_month_profit' => 0,
                        'weekend_profit' => 0,
                    ]);

                    $totalVehiclesCreated++;
                }

                $this->syncSpecifications($vehicle->id, $transmission, $fuel, $seats, $doors, (bool) ($carData['ISAIRCONDITION'] ?? true));
            }

            if (!$branchHasVehicles) {
                $this->info("  -> Branch {$branch->name} returned 0 vehicles across all durations. Removing it.");
                if (!$this->option('dry-run')) {
                    Vehicle::where('pickup_loc', $branch->id)->where('supplier', $supplierUserId)->delete();
                    $branch->delete();
                }
            }
        }

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Vehicles Created: {$totalVehiclesCreated}, Updated: {$totalVehiclesUpdated}.");
        }

        return self::SUCCESS;
    }

    /**
     * Map Xdrive/Kolaycar vehicle specs to local DB Specs.
     */
    private function syncSpecifications(int $vehicleId, string $transmission, string $fuel, int $seats, int $doors, bool $ac): void
    {
        $transmissionKey = strtolower($transmission) === 'automatic' ? 'Automatic Transmission' : 'Manual Transmission';
        $this->attachSpec($vehicleId, $transmissionKey);

        $fuelKey = match (strtolower($fuel)) {
            'diesel' => 'Diesel',
            'hybrid' => 'Hybrid',
            'electric' => 'Electric',
            default => 'Petrol'
        };
        $this->attachSpec($vehicleId, $fuelKey);
        
        if ($ac) {
            $this->attachSpec($vehicleId, 'Air Conditioning');
        }

        $this->attachSpec($vehicleId, "{$seats} Seats");
        $this->attachSpec($vehicleId, "{$doors} Doors");
    }

    private function attachSpec(int $vehicleId, string $specName): void
    {
        if (!isset($this->specDefinitions[$specName])) {
            return;
        }

        $specId = $this->specDefinitions[$specName]['id'];

        \App\Models\VehicleSpecification::firstOrCreate([
            'vehicle_id' => $vehicleId,
            'specification_id' => $specId,
        ]);
    }

    /**
     * Resolve the local category ID from a SIPP code or supplier category string.
     */
    private function resolveCategoryFromSipp(string $sipp, string $kolaycarCategory = ''): int
    {
        // Prioritize mapping the Kolaycar string first
        if (!empty($kolaycarCategory)) {
            // Map common Kolaycar terms to our local DB terms
            $normalizedKolaycar = match (strtolower($kolaycarCategory)) {
                'economic' => 'Economy',
                'compact' => 'Compact',
                default => $kolaycarCategory,
            };

            $category = \App\Models\Category::where('name', 'LIKE', "%{$normalizedKolaycar}%")->first();
            if ($category) {
                return $category->id;
            }
        }

        // Fallback to SIPP code
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
     * Normalize transmission value to local spec option.
     */
    private function normalizeTransmission(string $value): string
    {
        $lower = strtolower($value);
        if (str_contains($lower, 'auto') || str_contains($lower, 'automtic')) {
            return 'Automatic';
        }
        return 'Manual';
    }

    private function fetchVehiclesForDuration(KolaycarApiService $service, Branch $branch, ?int $days, bool $hasCustomDates): array
    {
        if ($hasCustomDates) {
            $pickupStr = $this->option('pickup-date') ?? Carbon::tomorrow()->format('Y-m-d 10:00');
            $dropoffStr = $this->option('dropoff-date') ?? Carbon::tomorrow()->addDay()->format('Y-m-d 10:00');
            $pickup = Carbon::parse($pickupStr);
            $dropoff = Carbon::parse($dropoffStr);
        } else {
            $days = $days ?: 1;
            $pickup = Carbon::tomorrow();
            $pickup->setTime(10, 0);
            $dropoff = Carbon::tomorrow()->addDays($days);
            $dropoff->setTime(10, 0);
            $this->info("  -> Syncing for {$days} day(s) duration.");
        }

        $pickupDateArg = $pickup->format('d.m.Y');
        $dropoffDateArg = $dropoff->format('d.m.Y');
        $pickupTimeArg = $pickup->format('H:i');
        $dropoffTimeArg = $dropoff->format('H:i');

        $response = $service->getVehicles(
            $branch->station_id,
            $branch->station_id,
            $pickupDateArg,
            $dropoffDateArg,
            $pickupTimeArg,
            $dropoffTimeArg
        );

        $vehicles = $response['VEHICLES'] ?? [];
        if (empty($vehicles)) {
            $this->info("  -> No vehicles returned for this duration.");
        }
        
        return $vehicles;
    }
}
