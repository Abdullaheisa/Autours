<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\NorthcarApiService;
use Carbon\Carbon;
use App\Console\Commands\Base\AbstractVehicleSyncCommand;
use App\Console\Commands\Traits\NormalizesVehicleNames;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Models\Specification;
use App\Models\VehicleSpecification;
use App\Services\SippDecoder;

class SyncNorthcarVehicles extends AbstractVehicleSyncCommand
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    protected $signature = 'northcar:sync-vehicles
                            {--pickup-date= : Pickup date (MM-DD-YYYY), defaults to tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}';

    protected $description = 'Sync vehicles from Northcar API.';

    private ?array $specDefinitions = null;

    protected function getSupplierDisplayName(): string
    {
        return 'Northcar';
    }

    protected function performSync(): int
    {
        $service = new NorthcarApiService();

        $supplierUser = User::firstOrCreate(
            ['email' => 'ashish@northcar.ca'],
            [
                'name' => 'Northcar Supplier',
                'role' => 'active_supplier',
                'password' => \Illuminate\Support\Facades\Hash::make('Qrentals@12345'),
                'company' => 'Northcar',
            ]
        );

        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Northcar branches found.');
            return self::FAILURE;
        }

        $this->loadSpecificationDefinitions();

        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addMonth()->format('m/d/Y');
        
        // Append 10:00 AM to ensure we query during standard business hours, otherwise it defaults to 12:00 AM (midnight) which returns no rates for closed offices.
        $baseDate = Carbon::parse($pickupDate . ' 10:00 AM');
        
        $pickupDateTime = $baseDate->format('mdY h:i A');
        $dropoffDateTime1 = (clone $baseDate)->addDay()->format('mdY h:i A');
        $dropoffDateTime7 = (clone $baseDate)->addDays(7)->format('mdY h:i A');
        $dropoffDateTime30 = (clone $baseDate)->addDays(30)->format('mdY h:i A');

        $this->info("Using pickup: {$pickupDateTime}");
        $pricesOnly = $this->hasOption('prices-only') && $this->option('prices-only');

        foreach ($allBranches as $branch) {
            $this->info("Fetching rates for branch: {$branch->station_id}");

            // 1 Day
            $data1 = $service->getAvailability($branch->station_id, $branch->station_id, $pickupDateTime, $dropoffDateTime1);
            $rates1 = $this->extractRates($data1);

            // 7 Days
            $data7 = $service->getAvailability($branch->station_id, $branch->station_id, $pickupDateTime, $dropoffDateTime7);
            $rates7 = $this->extractRates($data7);

            // 30 Days
            $data30 = $service->getAvailability($branch->station_id, $branch->station_id, $pickupDateTime, $dropoffDateTime30);
            $rates30 = $this->extractRates($data30);

            if (empty($rates1)) {
                $this->warn("No rates found for branch {$branch->station_id}. Deleting branch.");
                $branch->delete();
                continue;
            }

            foreach ($rates1 as $classCode => $rateInfo) {
                $vehicleName = $this->normalizeVehicleName($rateInfo['MakeModel'] ?: $classCode);
                
                $dayPrice = $rateInfo['RateCharge'];
                $weekPrice = $rates7[$classCode]['RateCharge'] ?? $dayPrice;
                $monthPrice = $rates30[$classCode]['RateCharge'] ?? $dayPrice;
                
                // If it's weekly/monthly total, convert to per day if needed. Assuming the API returns total or per day. 
                // We will assume it returns Total rate and we divide it to get per day for week/month if it's much larger.
                if ($weekPrice > $dayPrice * 3) {
                    $weekPrice = round($weekPrice / 7, 2);
                }
                if ($monthPrice > $dayPrice * 15) {
                    $monthPrice = round($monthPrice / 30, 2);
                }

                $tag = "[NORTHCAR-GROUP-ID:{$classCode}]";
                
                $vehicle = Vehicle::where('description', 'LIKE', "%{$tag}%")
                    ->where('pickup_loc', $branch->id)
                    ->first();

                if ($vehicle) {
                    $vehicle->update([
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'activation' => true,
                        'instant_confirmation' => 1,
                    ]);
                    $this->updatedCount++;
                } else {
                    if ($pricesOnly) continue;

                    $photoFilename = $this->resolveLocalPhoto($vehicleName);
                    
                    $vehicle = Vehicle::create([
                        'name' => $vehicleName,
                        'description' => $tag . ' ' . $vehicleName,
                        'photo' => $photoFilename,
                        'supplier' => $supplierUser->id,
                        'activation' => true,
                        'pickup_loc' => $branch->id,
                        'category' => $this->resolveCategoryFromSipp($classCode),
                        'fuel_policy_id' => null,
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'instant_confirmation' => 1,
                    ]);

                    \App\Models\Profit::create([
                        'vehicle_id' => $vehicle->id,
                        'supplier_id' => $supplierUser->id,
                        'branch_id' => $branch->id,
                        'per_day_profit' => 5,
                        'per_week_profit' => 5,
                        'per_month_profit' => 5,
                        'weekend_profit' => 5,
                    ]);

                    $this->syncVehicleSpecifications($vehicle, $classCode);
                    $this->createdCount++;
                }
            }
        }

        return self::SUCCESS;
    }

    private function extractRates(array $data): array
    {
        $rates = [];
        $payload = $data['Payload'] ?? null;
        if (!$payload) return $rates;
        
        $vehicles = $payload['Vehicles']['Vehicle'] ?? $payload['Vehicle'] ?? $payload['RateProduct'] ?? null;
        if (!$vehicles) return $rates;

        // Ensure array of vehicles
        if (isset($vehicles['ClassCode'])) {
            $vehicles = [$vehicles];
        }

        foreach ($vehicles as $v) {
            $classCode = $v['ClassCode'] ?? '';
            $rateCharge = (float)($v['RateCharge'] ?? $v['RateAmount'] ?? $v['TotalPricing']['RateCharge'] ?? 0);
            $makeModel = $v['ModelDesc'] ?? $v['VehicleMakeModel'] ?? $v['MakeModel'] ?? $classCode;

            if ($classCode && $rateCharge > 0) {
                $rates[$classCode] = [
                    'RateCharge' => $rateCharge,
                    'MakeModel' => $makeModel,
                ];
            }
        }

        return $rates;
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

    private function syncVehicleSpecifications(Vehicle $vehicle, string $sipp): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

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

        if (! empty($records)) {
            VehicleSpecification::query()->insert($records);
        }
    }

    private function resolveCategoryFromSipp(string $sipp): int
    {
        $categoryName = SippDecoder::getLocalCategoryName($sipp);
        
        if ($categoryName !== null) {
            $category = \App\Models\Category::where('name', $categoryName)->first();
            if ($category) {
                return $category->id;
            }
        }

        $fallback = \App\Models\Category::where('name', 'Economy')->first();
        return $fallback ? $fallback->id : 1;
    }
}
