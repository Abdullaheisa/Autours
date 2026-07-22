<?php

declare(strict_types=1);

namespace App\Console\Commands\Base;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\KolaycarApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

abstract class AbstractKolaycarVehicleSyncCommand extends AbstractVehicleSyncCommand
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * Cache of Specification definitions keyed by name.
     *
     * @var array<string, array>|null
     */
    private ?array $specDefinitions = null;

    abstract protected function getSupplierEmail(): string;
    abstract protected function getSupplierName(): string;
    abstract protected function getSupplierCompany(): string;
    abstract protected function getApiKey(): ?string;
    abstract protected function getApiPassword(): ?string;
    abstract protected function getTagPrefix(): string;

    protected function getSupplierDisplayName(): string
    {
        return $this->getSupplierName();
    }

    protected function performSync(): int
    {
        if (!$this->option('dry-run') && !$this->option('real')) {
            $this->error('You must specify either --dry-run or --real.');
            return self::FAILURE;
        }

        if ($this->option('dry-run') && $this->option('real')) {
            $this->error('You cannot specify both --dry-run and --real.');
            return self::FAILURE;
        }

        $apiKey = $this->getApiKey();
        $apiPass = $this->getApiPassword();
        $service = ($apiKey && $apiPass)
            ? new KolaycarApiService($apiKey, $apiPass)
            : new KolaycarApiService();

        // 1. Resolve supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => $this->getSupplierEmail()],
            [
                'name' => $this->getSupplierName(),
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => $this->getSupplierCompany(),
            ]
        );

        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // Load spec definitions
        if ($this->specDefinitions === null) {
            $this->specDefinitions = Specification::all()->keyBy('name')->toArray();
        }

        // 2. Fetch Branches for this Supplier
        $branches = Branch::where('company_id', $supplierUserId)->get();

        if ($branches->isEmpty()) {
            if ($this->option('dry-run')) {
                $this->warn('[DRY RUN] No branches found. Please run the sync-branches command first.');
            } else {
                $this->error("No active branches found for {$this->getSupplierName()}. Please run the sync-branches command first.");
                return self::FAILURE;
            }
        } else {
            $this->info("Found {$branches->count()} branches to process.");
        }

        $hasCustomDates = $this->option('pickup-date') || $this->option('dropoff-date');
        $durations = $hasCustomDates ? [null] : [1, 7, 30];

        $pricesOnly = $this->hasOption('prices-only') && $this->option('prices-only');
        $tagPrefix = $this->getTagPrefix();

        $progress = $this->output->createProgressBar($branches->count());
        $progress->start();

        foreach ($branches as $branch) {
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
                    
                    $tag = "[{$tagPrefix}:{$vehicleId}]";

                    if (!isset($allVehiclesByTag[$tag])) {
                        $allVehiclesByTag[$tag] = $carData;
                        $allVehiclesByTag[$tag]['parsed_prices'] = [];
                    }

                    $dPrice = (float) ($carData['DAILYPRICE'] ?? ($carData['TOTALPRICE'] ?? 0));
                    $daysKey = $hasCustomDates ? 1 : $days;
                    $allVehiclesByTag[$tag]['parsed_prices'][$daysKey] = $dPrice;
                }
            }

            foreach ($allVehiclesByTag as $tag => $carData) {
                if ($this->createdCount === 0 && $this->option('dry-run')) {
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
                $baggage = (int) filter_var($carData['BAGGAGEQUANTITY'] ?? '0', FILTER_SANITIZE_NUMBER_INT);
                
                $price1 = $carData['parsed_prices'][1] ?? null;
                $price7 = $carData['parsed_prices'][7] ?? null;
                $price30 = $carData['parsed_prices'][30] ?? null;

                $dayPrice = $price1 ?? 0;
                $weekPrice = $price7 ?? 0;
                $monthPrice = $price30 ?? 0;
                
                if ($dayPrice <= 0 && $weekPrice <= 0 && $monthPrice <= 0) {
                    continue;
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

                $vehicleId = $carData['CARGROUPID'] ?? $carData['ID'] ?? $carData['VEHICLEID'] ?? null;
                $descriptionTag = "[{$tagPrefix}:{$vehicleId}]";

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
                        'activation' => true,
                    ]);
                    $this->updatedCount++;

                    // In prices-only mode, skip updating specifications, photos, and inclusions
                    if ($pricesOnly) {
                        continue;
                    }
                } else {
                    // In prices-only mode, skip creating new vehicles
                    if ($pricesOnly) {
                        continue;
                    }

                    $image = '';
                    if (!empty($carData['VEHICLEIMAGES'][0]['VEHICLEIMAGE'])) {
                        $image = $carData['VEHICLEIMAGES'][0]['VEHICLEIMAGE'];
                    }
                    $localPhotoUrl = $this->resolveLocalPhoto($normalizedName) ?: $image;

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
                        'per_day_profit' => 5,
                        'per_week_profit' => 5,
                        'per_month_profit' => 5,
                        'weekend_profit' => 5,
                    ]);

                    $this->createdCount++;
                }

                // Sync specifications (Quick Win 3: only update if needed / avoid unnecessary deletes)
                if ($vehicle->wasRecentlyCreated || !$pricesOnly) {
                    $this->syncSpecifications($vehicle->id, $transmission, $fuel, $seats, $doors, (bool) ($carData['ISAIRCONDITION'] ?? true), $baggage);
                    
                    $inclusions = [];
                    foreach ($carData['RENTALCONDITIONS'] ?? [] as $condition) {
                        $condName = trim((string)($condition['RENTALCONDITIONNAME'] ?? ''));
                        if (!empty($condName)) {
                            $inclusions[] = $condName;
                        }
                    }
                    
                    $kmLimit = (string) ($carData['TOTALKMLIMIT'] ?? '');
                    if (!empty($kmLimit) && is_numeric($kmLimit) && $kmLimit > 0) {
                        $inclusions[] = "Mileage Limit: {$kmLimit} km";
                    }

                    if (!empty($inclusions)) {
                        $this->syncInclusions($vehicle, array_unique($inclusions));
                    }
                }
            }

            $progress->advance();
        }

        $progress->finish();
        
        $this->newLine();

        if (!$this->option('dry-run') && !$pricesOnly) {
            $branchesDeleted = 0;
            $emptyBranches = Branch::where('company_id', $supplierUserId)
                ->whereDoesntHave('vehicles', function ($q) {
                    $q->whereNull('deleted_at');
                })
                ->get();

            foreach ($emptyBranches as $emptyBranch) {
                $emptyBranch->delete();
                $branchesDeleted++;
                $this->warn("Deleted empty branch: {$emptyBranch->name}");
            }
            if ($branchesDeleted > 0) {
                $this->info("Deleted {$branchesDeleted} empty branches.");
            }
        }

        if ($this->createdCount > 0) {
            $createdCount = $this->createdCount;
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Automated Sync Alert: {$createdCount} new vehicle(s) have been added from {$supplierName}.",
                    function ($message) use ($supplierName, $createdCount) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("{$supplierName} Sync Notification: {$createdCount} New Vehicle(s) Added");
                    }
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send {$supplierName} new vehicle notification email: " . $e->getMessage());
            }
        }

        return self::SUCCESS;
    }

    private function syncSpecifications(int $vehicleId, string $transmission, string $fuel, int $seats, int $doors, bool $ac, int $baggage): void
    {
        \App\Models\VehicleSpecification::where('vehicle_id', $vehicleId)->delete();

        $records = [];
        $now = \Carbon\Carbon::now();

        if (isset($this->specDefinitions['Transmission'])) {
            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Transmission',
                'value' => strtolower($transmission) === 'automatic' ? 'Automatic' : 'Manual',
                'icon' => $this->specDefinitions['Transmission']['icon'] ?? 'gear',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Fuel'])) {
            $lowerFuel = strtolower($fuel);
            if (str_contains($lowerFuel, 'elektrik') || str_contains($lowerFuel, 'electric')) {
                $fuelType = 'Electric';
            } elseif (str_contains($lowerFuel, 'hibrit') || str_contains($lowerFuel, 'hybrid')) {
                $fuelType = 'Hybrid Petrol & Gas';
            } elseif (str_contains($lowerFuel, 'lpg') || str_contains($lowerFuel, 'gaz') || str_contains($lowerFuel, 'gas')) {
                $fuelType = 'Gas';
            } else {
                $fuelType = 'Petrol';
            }
            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Fuel',
                'value' => $fuelType,
                'icon' => $this->specDefinitions['Fuel']['icon'] ?? 'gas-pump',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($ac && isset($this->specDefinitions['Air Conditioner'])) {
            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Air Conditioner',
                'value' => 'Air Conditioning',
                'icon' => $this->specDefinitions['Air Conditioner']['icon'] ?? 'snowflake',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Doors'])) {
            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Doors',
                'value' => (string) $doors,
                'icon' => $this->specDefinitions['Doors']['icon'] ?? 'door-closed',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Number of seats'])) {
            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Number of seats',
                'value' => (string) $seats,
                'icon' => $this->specDefinitions['Number of seats']['icon'] ?? 'user',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($baggage > 0 && isset($this->specDefinitions['Suitcase'])) {
            $suitValue = 'Small';
            if ($baggage >= 4) {
                $suitValue = 'Large';
            } elseif ($baggage >= 2) {
                $suitValue = 'Medium';
            }

            $records[] = [
                'vehicle_id' => $vehicleId,
                'name' => 'Suitcase',
                'value' => $suitValue,
                'icon' => $this->specDefinitions['Suitcase']['icon'] ?? 'suitcase',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($records)) {
            \App\Models\VehicleSpecification::query()->insert($records);
        }
    }

    private function syncInclusions(\App\Models\Vehicle $vehicle, array $inclusions): void
    {
        $includedIds = [];
        foreach ($inclusions as $incText) {
            $inc = \App\Models\Included::firstOrCreate(['what_is_included' => $incText]);
            $includedIds[] = $inc->id;
        }
        $vehicle->included()->sync($includedIds);
    }

    private function resolveCategoryFromSipp(string $sipp, string $kolaycarCategory = ''): int
    {
        if (!empty($kolaycarCategory)) {
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

        $categoryName = \App\Services\SippDecoder::getLocalCategoryName($sipp);

        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        $fallback = \App\Models\Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : (\App\Models\Category::first()?->id ?? 1);
    }

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

        return $response['VEHICLES'] ?? [];
    }
}
