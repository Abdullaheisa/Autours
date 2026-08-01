<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;
use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\AutofixRestApiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class SyncAutofixVehicles extends AbstractKolaycarVehicleSyncCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'autofix:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles or specs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Autofix API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@autofixrental.com';
    }

    protected function getSupplierName(): string
    {
        return 'Autofix';
    }

    protected function getSupplierCompany(): string
    {
        return 'Autofix Rental';
    }

    protected function getApiKey(): ?string
    {
        return 'eff6LWe8plkb2ewqpRMkLQ==';
    }

    protected function getApiPassword(): ?string
    {
        return '2962AA3';
    }

    protected function getTagPrefix(): string
    {
        return 'Autofix-ID';
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

        $service = new AutofixRestApiService('eff6LWe8plkb2ewqpRMkLQ==', '2962AA3');

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
            $this->specDefinitions = \App\Models\Specification::all()->keyBy('name')->toArray();
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

                    if ($pricesOnly) {
                        continue;
                    }
                } else {
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
            $supplierName = $this->getSupplierName();
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

        $pickupDateArg = $pickup->format('d.m.Y');
        $dropoffDateArg = $dropoff->format('d.m.Y');
        $pickupTimeArg = $pickup->format('H:i');
        $dropoffTimeArg = $dropoff->format('H:i');

        // Cast service to AutofixRestApiService
        /** @var AutofixRestApiService $service */
        $vehicles = $service->getVehicles(
            (string) $branch->station_id,
            (string) $branch->station_id,
            $pickupDateArg,
            $dropoffDateArg,
            $pickupTimeArg,
            $dropoffTimeArg
        );

        $mapped = [];
        foreach ($vehicles as $v) {
            $mapped[] = [
                'VEHICLEID' => $v['vehicleId'] ?? null,
                'CARGROUPID' => $v['vehicleId'] ?? null,
                'DAILYPRICE' => $v['dailyPrice'] ?? null,
                'TOTALPRICE' => $v['totalPrice'] ?? null,
                'VEHICLENAME' => $v['vehicleName'] ?? '',
                'SIPPCODE' => $v['sippCode'] ?? '',
                'TRANSMISSIONTYPE' => $v['transmissionTypeName'] ?? 'Manual',
                'FUELTYPE' => $v['fuelTypeName'] ?? 'Gasoline',
                'PASSENGERQUANTITY' => $v['passangerQuantityName'] ?? '4',
                'VEHICLETYPE' => $v['vehicleTypeName'] ?? '',
                'BAGGAGEQUANTITY' => $v['baggageQuantityName'] ?? '0',
                'VEHICLECATEGORY' => $v['vehicleCategoryTypeName'] ?? '',
                'ISAIRCONDITION' => $v['isThereAirCondition'] ?? true,
                'TOTALKMLIMIT' => $v['totalKMLimit'] ?? null,
                'VEHICLEIMAGES' => !empty($v['vehicleImages']) ? array_map(function($img) {
                    return ['VEHICLEIMAGE' => $img['url'] ?? ''];
                }, $v['vehicleImages']) : [],
                'RENTALCONDITIONS' => !empty($v['rentalConditions']) ? array_map(function($cond) {
                    return ['RENTALCONDITIONNAME' => $cond];
                }, $v['rentalConditions']) : [],
            ];
        }

        return $mapped;
    }
}
