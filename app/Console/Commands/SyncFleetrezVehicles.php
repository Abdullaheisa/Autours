<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\FleetrezApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncFleetrezVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    protected $signature = 'fleetrez:sync-vehicles
                            {--date= : Pickup date (YYYY-MM-DD), defaults to tomorrow}
                            {--days=1 : Number of rental days to search}
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to 30 days in the future}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to 44 days in the future}
                            {--limit=0 : Limit the number of branches to process (0 = all)}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}';

    protected $description = 'Sync vehicles from Fleetrez API into Autours.';

    private ?array $specDefinitions = null;
    private int $createdCount = 0;
    private int $updatedCount = 0;

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

        $supplierUser = User::where('email', 'emissias@h-lead.gr')->first();
        if (!$supplierUser) {
            $supplierUser = User::firstOrCreate(
                ['email' => 'emissias@h-lead.gr'],
                [
                    'name' => 'h-lead.gr',
                    'role' => 'active_supplier',
                    'password' => Hash::make('Qrentals@12345'),
                    'company' => 'H-Lead Fleetrez',
                    'integration_type' => 'fleetrez',
                    'api_key' => 'hleadfleetrezapi@autours.com',
                    'api_password' => 'Aut26@!',
                ]
            );
        }

        $supplierUserId = $supplierUser->id;
        $this->info("Supplier user resolved: ID {$supplierUserId}");

        $this->loadSpecDefinitions();

        $username = $supplierUser->api_key ?: 'hleadfleetrezapi@autours.com';
        $password = $supplierUser->api_password ?: 'Aut26@!';
        $service = new FleetrezApiService($username, $password);

        $branches = Branch::where('company_id', $supplierUserId)->get();
        if ($branches->isEmpty()) {
            $this->warn('No active branches found for this supplier. Did you run fleetrez:sync-branches?');
            return self::FAILURE;
        }

        $limit = (int) $this->option('limit');
        if ($limit > 0) {
            $branches = $branches->take($limit);
        }

        $pickupDateStr = $this->option('pickup-date') ?: \Carbon\Carbon::now()->addDays(30)->format('Y-m-d 10:00');
        $dropoffDateStr = $this->option('dropoff-date') ?: \Carbon\Carbon::now()->addDays(44)->format('Y-m-d 10:00');

        $pickupDate = Carbon::parse($pickupDateStr);
        $dropoffDate = Carbon::parse($dropoffDateStr);
        $days = max(1, $pickupDate->diffInDays($dropoffDate));

        $this->info("Syncing vehicles for " . count($branches) . " branches from {$pickupDate->format('Y-m-d')} to {$dropoffDate->format('Y-m-d')} ({$days} days)...");

        foreach ($branches as $branch) {
            $this->info("Searching branch {$branch->name} (ID: {$branch->id}, Station ID: {$branch->station_id})");

            if (empty($branch->station_id)) {
                $this->warn("Skipping branch {$branch->id}: missing station_id");
                continue;
            }

            try {
                $response = $service->search(
                    (int) $branch->station_id,
                    (int) $branch->station_id,
                    $pickupDate->format('Y-m-d'),
                    $dropoffDate->format('Y-m-d'),
                    $pickupDate->format('H:i'),
                    $dropoffDate->format('H:i'),
                    30,
                    'Pay On Arrival'
                );
            } catch (\Exception $e) {
                $this->error("API Error on branch {$branch->id}: " . $e->getMessage());
                continue;
            }

            $cars = $response['carResponseModelList'] ?? [];
            if (empty($cars)) {
                $this->warn("No vehicles found for branch {$branch->id}");
                if (!$this->option('dry-run')) {
                    $this->warn("Deleting empty branch {$branch->name} (ID: {$branch->id})");
                    $branch->delete();
                }
                continue;
            }

            $this->info("Found " . count($cars) . " vehicles.");

            foreach ($cars as $car) {
                $this->processVehicle($car, $branch, $supplierUserId, $days);
            }
        }

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Created: {$this->createdCount}, Updated: {$this->updatedCount}.");
        }

        return self::SUCCESS;
    }

    private function processVehicle(array $car, Branch $branch, int $supplierUserId, int $days): void
    {
        $vehicleId = $car['vehicleId'] ?? null;
        $name = $car['name'] ?? 'Unknown Vehicle';
        if (!$vehicleId) return;

        $acriss = $car['acriss'] ?? '';
        $categoryName = $car['category'] ?? '';
        $categoryId = $this->resolveCategory($acriss, $categoryName);
        $normalizedName = $this->normalizeVehicleName($name);
        
        $totalPrice = (float) ($car['price']['amount'] ?? 0);
        $apiCurrency = $car['price']['currency'] ?? 'EUR'; // Fleetrez API always returns EUR
        $dayPrice = $days > 0 ? round($totalPrice / $days, 2) : $totalPrice;

        // Ensure branch currency matches API currency (Fleetrez always returns EUR)
        if ($branch->currency !== $apiCurrency) {
            $branch->update(['currency' => $apiCurrency]);
        }

        if ($this->option('dry-run')) {
            $this->line("  [DRY RUN] Would sync vehicle '{$normalizedName}' ({$acriss}) - Day Price: {$dayPrice}");
            return;
        }

        $descriptionTag = "[Fleetrez-ID:{$vehicleId}]";
        $vehicle = Vehicle::where('pickup_loc', $branch->id)
            ->where('description', 'LIKE', "%{$descriptionTag}%")
            ->first();

        if ($vehicle) {
            $vehicle->update([
                'name' => $normalizedName,
                'description' => $descriptionTag . ' ' . $name,
                'category' => $categoryId,
                'price' => $dayPrice,
                'week_price' => $dayPrice,
                'month_price' => $dayPrice,
                'activation' => true,
            ]);
            $this->updatedCount++;
        } else {
            $image = $car['image'] ?? '';
            $localPhotoUrl = $this->resolveLocalPhoto($normalizedName, $acriss, $categoryId) ?: $image;

            $vehicle = Vehicle::create([
                'name' => $normalizedName,
                'description' => $descriptionTag . ' ' . $name,
                'photo' => $localPhotoUrl,
                'supplier' => $supplierUserId,
                'activation' => true,
                'pickup_loc' => $branch->id,
                'category' => $categoryId,
                'fuel_policy_id' => null,
                'price' => $dayPrice,
                'week_price' => $dayPrice,
                'month_price' => $dayPrice,
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

        $this->syncSpecifications($vehicle->id, $car);
    }

    private function resolveCategory(string $acriss, string $categoryName): int
    {
        $lower = strtolower($categoryName);
        if (str_contains($lower, 'mini')) return 12; // Mini
        if (str_contains($lower, 'compact')) return 3; // Small/Compact
        if (str_contains($lower, 'economy')) return 5; // Economy
        if (str_contains($lower, 'suv')) return 8; // SUV
        if (str_contains($lower, 'van') || str_contains($lower, 'minivan')) return 10; // Minivan
        if (str_contains($lower, 'luxury')) return 9; // Luxury
        if (str_contains($lower, 'standard')) return 4; // Standard

        $firstChar = strtoupper(substr($acriss, 0, 1));
        return match ($firstChar) {
            'M', 'N' => 12, // Mini
            'E', 'H' => 5, // Economy
            'C', 'D' => 3, // Compact / Small
            'I', 'J', 'S', 'R', 'F', 'G' => 4, // Standard
            'P', 'U', 'L', 'W' => 9, // Luxury
            'O' => 8, // SUV / Oversize
            'V' => 10, // Minivan
            default => 3, // Compact fallback
        };
    }

    private function syncSpecifications(int $vehicleId, array $car): void
    {
        $specsToAttach = [];

        $trans = 'Manual';
        $fuel = 'Petrol';
        $ac = 'Yes';
        $doors = '4';

        foreach ($car['vehicleAttributeList'] ?? [] as $attr) {
            $key = strtolower($attr['attribute'] ?? '');
            $val = $attr['value'] ?? '';
            
            if (str_contains($key, 'transmission')) $trans = $val;
            if (str_contains($key, 'fuel')) $fuel = $val;
            if (str_contains($key, 'ac') || str_contains($key, 'air')) $ac = $val;
            if (str_contains($key, 'door')) $doors = $val;
        }

        $seats = (int)($car['adult'] ?? 5) + (int)($car['child'] ?? 0) + (int)($car['infant'] ?? 0);
        $seats = $seats > 0 ? (string)$seats : '5';
        $baggage = (string)((int)($car['largeBag'] ?? 0) + (int)($car['mediumBag'] ?? 0) + (int)($car['smallBag'] ?? 0));

        if (stripos($trans, 'Auto') !== false) {
            $specsToAttach[] = ['name' => 'Automatic', 'value' => 'Yes', 'icon' => 'las la-cogs'];
            $specsToAttach[] = ['name' => 'Manual', 'value' => 'No', 'icon' => 'las la-cogs'];
        } else {
            $specsToAttach[] = ['name' => 'Manual', 'value' => 'Yes', 'icon' => 'las la-cogs'];
            $specsToAttach[] = ['name' => 'Automatic', 'value' => 'No', 'icon' => 'las la-cogs'];
        }

        $specsToAttach[] = ['name' => 'Fuel Type', 'value' => $fuel, 'icon' => 'las la-gas-pump'];
        $specsToAttach[] = ['name' => 'Air Conditioner', 'value' => (stripos($ac, 'yes') !== false) ? 'Yes' : 'No', 'icon' => 'las la-snowflake'];
        $specsToAttach[] = ['name' => 'Number of Doors', 'value' => $doors, 'icon' => 'las la-door-open'];
        $specsToAttach[] = ['name' => 'Number of Adults', 'value' => $seats, 'icon' => 'las la-user'];
        $specsToAttach[] = ['name' => 'Number of Luggages', 'value' => $baggage, 'icon' => 'las la-suitcase'];

        VehicleSpecification::where('vehicle_id', $vehicleId)->delete();
        foreach ($specsToAttach as $sp) {
            if ($sp['name']) {
                VehicleSpecification::create([
                    'vehicle_id' => $vehicleId,
                    'name' => $sp['name'],
                    'value' => $sp['value'],
                    'icon' => $sp['icon']
                ]);
            }
        }
    }

    private function loadSpecDefinitions(): void
    {
        $specs = Specification::all();
        $this->specDefinitions = [];
        foreach ($specs as $s) {
            $this->specDefinitions[strtolower(trim($s->name))] = $s->id;
        }
    }

    private function getSpecId(string $name): ?int
    {
        $key = strtolower(trim($name));
        if (isset($this->specDefinitions[$key])) {
            return $this->specDefinitions[$key];
        }
        $spec = Specification::create(['name' => $name, 'options' => json_encode([]), 'icon' => 'las la-check']);
        $this->specDefinitions[$key] = $spec->id;
        return $spec->id;
    }
}
