<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Included;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\RenteonApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

class SyncRenteonVehicles extends Command
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'renteon:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd), defaults to tomorrow}
                            {--full : Check availability for ALL Renteon branches, otherwise only checks branches that already have vehicles}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Renteon API. Strictly inserts new vehicles without overwriting existing ones.';

    private ?array $specDefinitions = null;
    private array $imageCache = [];

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        ini_set('memory_limit', '512M');

        $service = new RenteonApiService();

        // 1. Resolve Renteon supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'arda@essencecarrental.com'],
            [
                'name' => 'Renteon (' . RenteonApiService::PROVIDER_CODE . ')',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Renteon',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Load specs
        $this->loadSpecificationDefinitions();

        // 3. Resolve Renteon branches
        $query = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id');

        if (! $this->option('full')) {
            $query->has('vehicles');
            $this->info('Mode: Only syncing branches that already have vehicles. Use --full to sync all branches.');
        }

        $allBranches = $query->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Renteon branches found. Run: php artisan renteon:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // 4. Resolve dates
        // Renteon format requires ISO 8601 without timezone: 'YYYY-MM-DDTHH:mm:ss'
        $pickupDateObj = $this->option('pickup-date') 
            ? Carbon::parse($this->option('pickup-date')) 
            : Carbon::now()->addMonth();

        $pickupTimeStr = 'T10:00:00';
        $pickupDateStr = $pickupDateObj->format('Y-m-d') . $pickupTimeStr;
        $dropoffDate1Str = $pickupDateObj->copy()->addDay()->format('Y-m-d') . $pickupTimeStr;
        $dropoffDate7Str = $pickupDateObj->copy()->addDays(7)->format('Y-m-d') . $pickupTimeStr;
        $dropoffDate30Str = $pickupDateObj->copy()->addDays(30)->format('Y-m-d') . $pickupTimeStr;

        $this->info("Using pickup date: {$pickupDateStr}");

        // 5. Pre-load existing Renteon vehicles to strictly avoid overwriting
        $allExistingVehicles = Vehicle::where('description', 'LIKE', '%[RENTEON-GROUP-ID:%')
            ->get();

        $existingVehiclesByTag = [];
        foreach ($allExistingVehicles as $v) {
            if (preg_match('/\[RENTEON-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                $existingVehiclesByTag[$m[1]][$v->pickup_loc] = true;
            }
        }

        $created = 0;
        $skipped = 0;

        // 6. Process each branch sequentially
        $progress = $this->output->createProgressBar($allBranches->count());
        $progress->start();

        foreach ($allBranches as $branch) {
            $stationId = $branch->station_id;
            $currency = current(array_filter([$branch->currency, 'EUR']));

            $prices1 = $this->fetchPricesMapped($service, $stationId, $pickupDateStr, $dropoffDate1Str, $currency);
            $prices7 = $this->fetchPricesMapped($service, $stationId, $pickupDateStr, $dropoffDate7Str, $currency);
            $prices30 = $this->fetchPricesMapped($service, $stationId, $pickupDateStr, $dropoffDate30Str, $currency);

            // Merge prices
            foreach ($prices1 as $groupId => $data1) {
                $tag = "[RENTEON-GROUP-ID:{$groupId}]";

                // Strictly skip if already exists for this branch
                if (isset($existingVehiclesByTag[$groupId][$branch->id])) {
                    $skipped++;
                    continue;
                }

                $dayPrice = $data1['price'];
                if ($dayPrice <= 0) {
                    continue;
                }

                $weekPrice = isset($prices7[$groupId]) ? $prices7[$groupId]['price'] : round($dayPrice * 7, 2);
                $monthPrice = isset($prices30[$groupId]) ? $prices30[$groupId]['price'] : round($dayPrice * 30, 2);
                $respCurrency = $data1['currency'] ?? $currency;

                // Currency conversion
                $branchCurrency = $branch->currency;
                if (!empty($respCurrency) && !empty($branchCurrency) && $respCurrency !== $branchCurrency) {
                    $rate = \App\Models\CurrencyRate::where('currency_from', $respCurrency)
                        ->where('currency_to', $branchCurrency)
                        ->first();
                    if ($rate) {
                        $dayPrice = round($dayPrice * $rate->rate, 2);
                        $weekPrice = round($weekPrice * $rate->rate, 2);
                        $monthPrice = round($monthPrice * $rate->rate, 2);
                        $respCurrency = $branchCurrency;
                    }
                }

                $vehicleName = $data1['name'] ?: 'Unknown Model';
                $vehicleName = $this->normalizeVehicleName($vehicleName);
                $photoUrl = $data1['imageurl'] ?? null;
                $photoFilename = $this->resolveLocalPhoto($vehicleName);
                
                $categoryId = $this->resolveCategoryFromSipp($data1['acriss']);

                $vehicle = Vehicle::create([
                    'name' => $vehicleName,
                    'description' => $tag . ' ' . $vehicleName,
                    'photo' => $photoFilename,
                    'supplier' => $supplierUser->id,
                    'activation' => true,
                    'pickup_loc' => $branch->id,
                    'category' => $categoryId,
                    'fuel_policy_id' => null,
                    'price' => $dayPrice,
                    'week_price' => $weekPrice,
                    'month_price' => $monthPrice,
                ]);

                \App\Models\Profit::create([
                    'vehicle_id' => $vehicle->id,
                    'supplier_id' => $supplierUser->id,
                    'branch_id' => $branch->id,
                    'per_day_profit' => 10,
                    'per_week_profit' => 10,
                    'per_month_profit' => 10,
                    'weekend_profit' => 10,
                ]);

                $this->syncVehicleSpecifications($vehicle, $data1);
                $this->syncInclusions($vehicle, $data1['inclusions'] ?? []);

                // Mark as existing so we don't duplicate within same run if somehow repeated
                $existingVehiclesByTag[$groupId][$branch->id] = true;
                $created++;
            }

            $progress->advance();
        }

        $progress->finish();
        $this->newLine();

        // 7. Clean up branches without vehicles
        $orphanedCount = 0;
        foreach ($allBranches as $branch) {
            if ($branch->vehicles()->count() === 0) {
                $branch->delete();
                $orphanedCount++;
            }
        }

        $this->info('========== Renteon Vehicle Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Skipped  : {$skipped} (Already existing)");
        $this->info("Deleted  : {$orphanedCount} (Empty branches)");
        $this->info('===================================================');

        return self::SUCCESS;
    }

    private function fetchPricesMapped(RenteonApiService $service, string $stationId, string $pickupDateStr, string $dropoffDateStr, string $currency): array
    {
        $response = $service->getAvailability($stationId, $stationId, $pickupDateStr, $dropoffDateStr, $currency);
        $mapped = [];

        foreach ($response as $item) {
            $groupId = $item['CarCategory'] ?? 'UNKNOWN';
            
            // To be unique, we can use CarCategory or ConnectorCarCategoryId if present
            if (!empty($item['ConnectorCarCategoryId'])) {
                $groupId = $groupId . '-' . $item['ConnectorCarCategoryId'];
            }

            $inclusions = [];
            if (!empty($item['IncludedServices'])) {
                foreach ($item['IncludedServices'] as $inc) {
                    $inclusions[] = $inc['Name'] ?? 'Included Service';
                }
            }

            $name = $item['ModelName'] ?? 'Unknown';
            $acriss = $item['CarCategory'] ?? '';

            if (!empty($acriss) && strlen($acriss) >= 4) {
                $trans = strtoupper($acriss[2]);
                if (in_array($trans, ['A', 'B', 'D']) && stripos($name, 'Auto') === false) {
                    $name .= ' Automatic';
                }

                $fuel = strtoupper($acriss[3]);
                if (in_array($fuel, ['D', 'Q', 'Z']) && stripos($name, 'Diesel') === false) {
                    $name .= ' Diesel';
                } elseif (in_array($fuel, ['H', 'I']) && stripos($name, 'Hybrid') === false) {
                    $name .= ' Hybrid';
                } elseif (in_array($fuel, ['E', 'C', 'V']) && stripos($name, 'Electric') === false) {
                    $name .= ' Electric';
                }
            }

            $mapped[$groupId] = [
                'name' => $name,
                'acriss' => $acriss,
                'price' => $item['Amount'] ?? 0,
                'currency' => $item['Currency'] ?? $currency,
                'imageurl' => $item['CarModelImageURL'] ?? null,
                'pax' => $item['PassengerCapacity'] ?? null,
                'doors' => $item['NumberOfDoors'] ?? null,
                'suitcases' => ($item['BigBagsCapacity'] ?? 0) + ($item['SmallBagsCapacity'] ?? 0),
                'inclusions' => $inclusions,
            ];
        }

        return $mapped;
    }

    private function syncInclusions(Vehicle $vehicle, array $inclusions): void
    {
        $includedIds = [];
        foreach ($inclusions as $incText) {
            $inc = Included::firstOrCreate(['what_is_included' => $incText]);
            $includedIds[] = $inc->id;
        }
        if (!empty($includedIds)) {
            $vehicle->included()->sync($includedIds);
        }
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

    private function syncVehicleSpecifications(Vehicle $vehicle, array $data): void
    {
        $records = [];
        $now = Carbon::now()->toDateTimeString();

        $doors = $data['doors'] ?? null;
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

        $seats = $data['pax'] ?? null;
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

        $sipp = (string) $data['acriss'];

        if (isset($this->specDefinitions['Transmission'])) {
            $transValue = \App\Services\SippDecoder::getLocalTransmissionName($sipp);
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => $transValue,
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $suitcases = $data['suitcases'] ?? null;
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

        if (isset($this->specDefinitions['Air Conditioner'])) {
            $acValue = \App\Services\SippDecoder::getLocalAcName($sipp);
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
            $fuelType = \App\Services\SippDecoder::getLocalFuelName($sipp);
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

    private function resolveCategoryFromSipp(string $sipp): int
    {
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

    private function downloadImage(?string $url, string $groupId): ?string
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);
        $url = str_replace(' ', '%20', $url);

        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            // It could be a relative URL from Renteon base URL
            if (str_starts_with($url, '/')) {
                $url = 'https://aggregator.renteon.com' . $url;
            } else {
                return $url;
            }
        }

        $cacheKey = $groupId . '|' . $url;
        if (array_key_exists($cacheKey, $this->imageCache)) {
            return $this->imageCache[$cacheKey];
        }

        $extension = pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'renteon_' . Str::slug($groupId) . '.' . $extension;
        $directory = public_path('img/vehicles');
        $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;

        if (file_exists($fullPath) && filesize($fullPath) > 0) {
            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        }

        try {
            $response = Http::timeout(15)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                Log::warning("Renteon image download failed", ['url' => $url]);
                $this->imageCache[$cacheKey] = null;
                return null;
            }

            $contentType = $response->header('Content-Type') ?? '';
            $body = $response->body();

            if (! str_starts_with($contentType, 'image/')) {
                $this->imageCache[$cacheKey] = null;
                return null;
            }

            $mimeTypes = new MimeTypes();
            $extensions = $mimeTypes->getExtensions(strtok($contentType, ';'));
            if (! empty($extensions)) {
                $extension = $extensions[0];
            }

            $filename = 'renteon_' . Str::slug($groupId) . '.' . $extension;

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;
            file_put_contents($fullPath, $body);

            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        } catch (\Exception $e) {
            Log::warning("Renteon image download exception", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $this->imageCache[$cacheKey] = null;
            return null;
        }
    }
}
