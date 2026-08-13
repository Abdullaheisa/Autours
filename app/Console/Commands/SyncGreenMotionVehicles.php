<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractVehicleSyncCommand;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Profit;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\GreenMotionApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncGreenMotionVehicles extends AbstractVehicleSyncCommand
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    protected $signature = 'greenmotion:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles or specs}
                            {--us-source : Use the US source credentials}';

    protected $description = 'Sync vehicles from Green Motion API into Autours.';

    protected ?array $specDefinitions = null;

    protected function getSupplierDisplayName(): string
    {
        return 'Green Motion';
    }

    protected function performSync(): int
    {
        if (!$this->option('dry-run') && !$this->option('real')) {
            $this->error('You must specify either --dry-run or --real.');
            return self::FAILURE;
        }

        $username = $this->option('us-source') ? 'GMatob@2026!' : 'GMato@2026!';
        $password = $this->option('us-source') ? 'GMatob@2026!' : 'GMato@2026!';

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

        if ($this->specDefinitions === null) {
            $this->specDefinitions = Specification::all()->keyBy('name')->toArray();
        }

        $branches = Branch::where('company_id', $supplierUserId)->get();

        if ($branches->isEmpty()) {
            if ($this->option('dry-run')) {
                $this->warn('[DRY RUN] No branches found. Please run the sync-branches command first.');
            } else {
                $this->error("No active branches found. Please run the sync-branches command first.");
                return self::FAILURE;
            }
        } else {
            $this->info("Found {$branches->count()} branches to process.");
        }

        $hasCustomDates = $this->option('pickup-date') || $this->option('dropoff-date');
        $durations = $hasCustomDates ? [null] : [1, 7, 30];
        $pricesOnly = $this->hasOption('prices-only') && $this->option('prices-only');
        $tagPrefix = 'GM-ID';

        $progress = $this->output->createProgressBar($branches->count());
        $progress->start();

        foreach ($branches as $branch) {
            $allVehiclesByTag = [];

            foreach ($durations as $days) {
                $vehicles = $this->fetchVehiclesForDuration($service, $branch, $days, $hasCustomDates);

                foreach ($vehicles as $carData) {
                    $vehicleId = $carData['@attributes']['id'] ?? null;
                    if (!$vehicleId) continue;
                    
                    $tag = "[{$tagPrefix}:{$vehicleId}]";

                    if (!isset($allVehiclesByTag[$tag])) {
                        $allVehiclesByTag[$tag] = $carData;
                        $allVehiclesByTag[$tag]['parsed_prices'] = [];
                    }

                    $dPrice = (float) (is_array($carData['total']) ? ($carData['total'][0] ?? 0) : $carData['total']);
                    $daysKey = $hasCustomDates ? 1 : $days;
                    $allVehiclesByTag[$tag]['parsed_prices'][$daysKey] = $dPrice;
                }
            }

            foreach ($allVehiclesByTag as $tag => $carData) {
                $vehicleName = (string) ($carData['@attributes']['name'] ?? '');
                if (empty($vehicleName)) {
                    continue;
                }

                $transmission = $this->extractString($carData['transmission'] ?? null, 'Manual');
                $fuel = $this->extractString($carData['fuel'] ?? null, 'Petrol');
                $seats = (int) filter_var($this->extractString($carData['adults'] ?? null, '4'), FILTER_SANITIZE_NUMBER_INT);
                
                // Estimate doors
                $doors = str_contains(strtolower($vehicleName), '5') ? 5 : (str_contains(strtolower($vehicleName), '3') ? 3 : 4);
                
                $baggageSmall = (int) filter_var($this->extractString($carData['luggageSmall'] ?? null, '0'), FILTER_SANITIZE_NUMBER_INT);
                $baggageLarge = (int) filter_var($this->extractString($carData['luggageLarge'] ?? null, '0'), FILTER_SANITIZE_NUMBER_INT);
                $baggage = $baggageSmall + $baggageLarge;

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
                $transValue = $transmission ? $this->normalizeTransmission($transmission) : 'Manual';

                if (stripos($normalizedName, 'Automatic') === false && stripos($normalizedName, 'Manual') === false) {
                    $normalizedName .= ' ' . $transValue;
                }

                $groupName = $this->extractString($carData['groupName'] ?? null, '');
                $categoryId = $this->resolveCategoryFromGroupName($groupName);

                if ($this->option('dry-run')) {
                    $this->line("  [DRY RUN] Would sync vehicle '{$normalizedName}' - Price: {$dayPrice}");
                    continue;
                }

                $vehicleId = $carData['@attributes']['id'] ?? null;
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

                    if ($pricesOnly) {
                        continue;
                    }
                } else {
                    if ($pricesOnly) {
                        continue;
                    }

                    $image = $carData['@attributes']['image'] ?? '';
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
                    
                    Profit::create([
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

                if ($vehicle->wasRecentlyCreated || !$pricesOnly) {
                    $acValue = $this->extractString($carData['airConditioning'] ?? null, 'no');
                    $ac = strtolower($acValue) === 'yes';
                    $this->syncSpecifications($vehicle->id, $transmission, $fuel, $seats, $doors, $ac, $baggage);
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
            $supplierName = $this->getSupplierDisplayName();
            try {
                Mail::raw(
                    "Automated Sync Alert: {$createdCount} new vehicle(s) have been added from {$supplierName}.",
                    function ($message) use ($supplierName, $createdCount) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("{$supplierName} Sync Notification: {$createdCount} New Vehicle(s) Added");
                    }
                );
            } catch (\Exception $e) {
                Log::error("Failed to send {$supplierName} new vehicle notification email: " . $e->getMessage());
            }
        }

        return self::SUCCESS;
    }

    protected function syncSpecifications(int $vehicleId, string $transmission, string $fuel, int $seats, int $doors, bool $ac, int $baggage): void
    {
        VehicleSpecification::where('vehicle_id', $vehicleId)->delete();

        $records = [];
        $now = Carbon::now();

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
            VehicleSpecification::query()->insert($records);
        }
    }

    protected function resolveCategoryFromGroupName(string $groupName): int
    {
        $fallback = Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : (Category::first()?->id ?? 1);
    }

    protected function extractString($value, string $default = ''): string
    {
        if (is_array($value)) {
            if (empty($value)) {
                return $default;
            }
            return isset($value[0]) ? (string) $value[0] : $default;
        }
        return (string) ($value ?? $default);
    }

    protected function normalizeTransmission(string $value): string
    {
        $lower = strtolower($value);
        if (str_contains($lower, 'auto') || str_contains($lower, 'automtic')) {
            return 'Automatic';
        }
        return 'Manual';
    }

    protected function fetchVehiclesForDuration($service, Branch $branch, ?int $days, bool $hasCustomDates): array
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

        $pickupDateArg = $pickup->format('Y-m-d');
        $dropoffDateArg = $dropoff->format('Y-m-d');
        $pickupTimeArg = $pickup->format('H:i');
        $dropoffTimeArg = $dropoff->format('H:i');

        return $service->getVehicles(
            (int)$branch->station_id,
            $pickupDateArg,
            $pickupTimeArg,
            $dropoffDateArg,
            $dropoffTimeArg,
            30,
            $branch->currency ?? 'GBP'
        );
    }
}
