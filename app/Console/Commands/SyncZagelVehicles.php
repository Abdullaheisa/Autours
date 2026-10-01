<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Included;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Console\Commands\Traits\NormalizesVehicleNames;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SyncZagelVehicles extends Command
{
    use NormalizesVehicleNames, ResolvesLocalVehiclePhoto;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zagel:sync-vehicles {--dry-run : Only fetch from API and print what would be done}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Zagel Express API into Autours.';

    private array $specDefinitions = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $supplierUserId = 170;

        $branches = Branch::where('company_id', $supplierUserId)->where('activation', true)->get();
        if ($branches->isEmpty()) {
            $this->warn('No Zagel Express branches found. Run sync-branches first.');
            return self::FAILURE;
        }

        $this->loadSpecificationDefinitions();

        $page = 1;
        $lastPage = 1;

        $syncedVehicleIds = [];

        do {
            $this->info("Fetching vehicles page {$page}...");
            $response = Http::withoutVerifying()->get("https://zagelexpress.net/api/v1/vehicles?per_page=50&page={$page}");

            if (!$response->successful()) {
                $this->error('Failed to fetch vehicles. HTTP ' . $response->status());
                return self::FAILURE;
            }

            $data = $response->json();
            $vehicles = $data['data'] ?? [];
            $meta = $data['meta'] ?? [];
            $lastPage = $meta['last_page'] ?? 1;

            foreach ($vehicles as $vehicleData) {
                $zagelId = $vehicleData['id'];
                $brand = $vehicleData['brand'] ?? '';
                $model = $vehicleData['model'] ?? '';
                $name = trim($brand . ' ' . $model);
                $name = $this->normalizeVehicleName($name);

                $dayPrice = (float) ($vehicleData['daily_rate'] ?? 0);
                $weekPrice = (float) ($vehicleData['weekly_rate'] ?? 0);
                $monthPrice = (float) ($vehicleData['monthly_rate'] ?? 0);
                $isActive = !empty($vehicleData['is_active']) && ($vehicleData['status'] === 'available');

                $categoryName = $vehicleData['category']['name'] ?? '';
                $categoryId = $this->resolveCategory($categoryName);

                $photoFilename = $this->resolveLocalPhoto($name);

                $inclusions = $vehicleData['features'] ?? [];
                
                foreach ($branches as $branch) {
                    $tag = "[ZAGEL-ID:{$zagelId}]";

                    $vehicle = Vehicle::where('supplier', $supplierUserId)
                        ->where('pickup_loc', $branch->id)
                        ->where('description', 'LIKE', "%{$tag}%")
                        ->first();

                    if ($this->option('dry-run')) {
                        $action = $vehicle ? 'Update' : 'Create';
                        $this->line("[DRY RUN] Would {$action} vehicle {$name} at branch {$branch->name} (Price: {$dayPrice})");
                        continue;
                    }

                    if ($vehicle) {
                        $vehicle->update([
                            'name' => $name,
                            'photo' => $photoFilename ?: $vehicle->photo,
                            'category' => $categoryId,
                            'price' => $dayPrice,
                            'week_price' => $weekPrice ?: $dayPrice,
                            'month_price' => $monthPrice ?: $dayPrice,
                            'activation' => $isActive,
                        ]);
                    } else {
                        $vehicle = Vehicle::create([
                            'name' => $name,
                            'description' => $tag,
                            'photo' => $photoFilename,
                            'supplier' => $supplierUserId,
                            'activation' => $isActive,
                            'pickup_loc' => $branch->id,
                            'category' => $categoryId,
                            'price' => $dayPrice,
                            'week_price' => $weekPrice ?: $dayPrice,
                            'month_price' => $monthPrice ?: $dayPrice,
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
                    }

                    $syncedVehicleIds[] = $vehicle->id;

                    $this->syncSpecifications($vehicle, $vehicleData);
                    $this->syncInclusions($vehicle, $inclusions);
                }
            }

            $page++;
        } while ($page <= $lastPage);

        if (!$this->option('dry-run')) {
            // Deactivate vehicles not synced
            Vehicle::where('supplier', $supplierUserId)
                ->where('description', 'LIKE', '%[ZAGEL-ID:%')
                ->whereNotIn('id', $syncedVehicleIds)
                ->update(['activation' => false]);
            
            $this->info("Sync complete. Synced " . count($syncedVehicleIds) . " vehicles.");
        }

        return self::SUCCESS;
    }

    private function resolveCategory(string $name): int
    {
        if (str_contains($name, 'اقتصادي')) return 5; // Economy
        if (str_contains($name, 'دفع رباعي')) return 8; // SUV
        return 4; // Standard fallback
    }

    private function loadSpecificationDefinitions(): void
    {
        foreach (Specification::all() as $spec) {
            $this->specDefinitions[$spec->name] = [
                'id' => $spec->id,
                'icon' => $spec->icon,
            ];
        }
    }

    private function syncSpecifications(Vehicle $vehicle, array $data): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();
        $records = [];
        $now = now()->toDateTimeString();

        $vName = strtolower($vehicle->name);
        $isSuv = str_contains($vName, 'tahoe') ||
                 str_contains($vName, 'pajero') ||
                 str_contains($vName, 'armada') ||
                 str_contains($vName, 'gx460') ||
                 str_contains($vName, 'rouge') ||
                 str_contains($vName, 'rogue') ||
                 str_contains($vName, 'tucson') ||
                 str_contains($vName, 'sportage') ||
                 str_contains($vName, 'jetour') ||
                 str_contains($vName, 'zrv') ||
                 str_contains($vName, 'pailot') ||
                 str_contains($vName, 'pilot') ||
                 str_contains($vName, 'soul');

        $isSevenSeater = str_contains($vName, 'tahoe') ||
                         str_contains($vName, 'armada') ||
                         str_contains($vName, 'pajero') ||
                         str_contains($vName, 'gx460') ||
                         str_contains($vName, 'pailot') ||
                         str_contains($vName, 'pilot');

        // Resolve doors: sedans have 4 doors, SUVs have 5 doors. Never allow invalid values like 3.
        $doors = (int) ($data['doors'] ?? 0);
        if ($doors < 4) {
            $doors = $isSuv ? 5 : 4;
        } elseif ($doors === 4 && $isSuv && (str_contains($vName, 'tahoe') || str_contains($vName, 'armada') || str_contains($vName, 'pajero') || str_contains($vName, 'gx460'))) {
            $doors = 5;
        }

        if (isset($this->specDefinitions['Doors'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Doors',
                'value' => (string) $doors,
                'icon' => $this->specDefinitions['Doors']['icon'] ?? 'DoorOpen',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Resolve seats: 7 for large SUVs, 5 for all other consumer cars
        $seats = (int) ($data['seats'] ?? 0);
        if ($isSevenSeater && $seats < 7) {
            $seats = 7;
        } elseif (!$isSevenSeater && $seats < 5) {
            $seats = 5;
        }

        if (isset($this->specDefinitions['Number of seats'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Number of seats',
                'value' => (string) $seats,
                'icon' => $this->specDefinitions['Number of seats']['icon'] ?? 'Armchair',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $transmission = strtolower($data['transmission'] ?? '');
        if (isset($this->specDefinitions['Transmission'])) {
            $transVal = str_contains($transmission, 'man') ? 'Manual' : 'Automatic';
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transVal,
                'icon' => $this->specDefinitions['Transmission']['icon'] ?? 'Settings2',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $fuel = $data['fuel_type'] ?? '';
        if (isset($this->specDefinitions['Fuel'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Fuel',
                'value' => !empty($fuel) ? ucfirst(strtolower($fuel)) : 'Petrol',
                'icon' => $this->specDefinitions['Fuel']['icon'] ?? 'Fuel',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (isset($this->specDefinitions['Suitcase'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Suitcase',
                'value' => $isSevenSeater ? 'Large' : 'Medium',
                'icon' => $this->specDefinitions['Suitcase']['icon'] ?? 'Luggage',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // All modern passenger rental vehicles in Oman feature Air Conditioning
        if (isset($this->specDefinitions['Air Conditioner'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Air Conditioner',
                'value' => 'Air Conditioning',
                'icon' => $this->specDefinitions['Air Conditioner']['icon'] ?? 'Wind',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($records)) {
            VehicleSpecification::insert($records);
        }
    }

    private function syncInclusions(Vehicle $vehicle, array $features): void
    {
        $translationMap = [
            'تكييف' => 'Air Conditioning',
            'مقود باور' => 'Power Steering',
            'نوافذ كهربائية' => 'Power Windows',
            'بلوتوث' => 'Bluetooth',
            'شحن USB' => 'USB Charging',
            'كاميرا خلفية' => 'Rearview Camera',
            'مثبت سرعة' => 'Cruise Control',
            'راديو' => 'Radio',
            'نظام صوت فاخر' => 'Premium Audio System',
            'أقفال كهربائية' => 'Power Locks',
            'تشغيل عن بُعد' => 'Remote Start',
            'تشغيل عن بعد' => 'Remote Start',
            'دخول بدون مفتاح' => 'Keyless Entry',
            'دفع رباعي' => '4WD',
            'دفع رباعى' => '4WD',
            'ملاحة GPS' => 'GPS Navigation',
            'فتحة سقف' => 'Sunroof',
            'مقاعد مدفأة' => 'Heated Seats',
            'مصابيح ضباب' => 'Fog Lights',
        ];

        $uniqueFeatures = array_unique($features);
        if (!in_array('تكييف', $uniqueFeatures)) {
            $uniqueFeatures[] = 'تكييف';
        }

        $includedIds = [];
        foreach ($uniqueFeatures as $feat) {
            $feat = trim($feat);
            if (isset($translationMap[$feat])) {
                $feat = $translationMap[$feat];
            }
            $inc = Included::firstOrCreate(['what_is_included' => $feat]);
            $includedIds[] = $inc->id;
        }
        $vehicle->included()->sync($includedIds);
    }
}
