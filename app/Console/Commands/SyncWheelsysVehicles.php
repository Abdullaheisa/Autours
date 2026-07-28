<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Included;
use App\Models\Specification;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Services\WheelsysApiService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\Mime\MimeTypes;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Console\Commands\Traits\NormalizesVehicleNames;

use App\Console\Commands\Base\AbstractVehicleSyncCommand;

class SyncWheelsysVehicles extends AbstractVehicleSyncCommand
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'wheelsys:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd), defaults to tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not create vehicles or specs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Wheelsys API. Strictly inserts new vehicles without overwriting existing ones.';

    private ?array $specDefinitions = null;
    private array $imageCache = [];

    protected function getSupplierDisplayName(): string
    {
        return 'Wheelsys';
    }

    /**
     * Execute the console command synchronization logic.
     */
    protected function performSync(): int
    {
        error_reporting(E_ALL & ~E_DEPRECATED);
        ini_set('memory_limit', '512M');


        $service = new WheelsysApiService();

        // 1. Resolve Wheelsys supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'milva.supe@autowill-rentacar.hr'],
            [
                'name' => 'Wheelsys',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Wheelsys',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Load specs
        $this->loadSpecificationDefinitions();

        // 3. Resolve all Wheelsys branches
        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Wheelsys branches found. Run: php artisan wheelsys:sync-branches');
            return self::FAILURE;
        }

        $this->info('Branches loaded: ' . $allBranches->count());

        // 4. Resolve dates
        // Wheelsys format requires DD/MM/YYYY
        $pickupDateObj = $this->option('pickup-date') 
            ? Carbon::parse($this->option('pickup-date')) 
            : Carbon::now()->addMonth();

        $pickupDateStr = $pickupDateObj->format('d/m/Y');
        $dropoffDate1Str = $pickupDateObj->copy()->addDay()->format('d/m/Y');
        $dropoffDate7Str = $pickupDateObj->copy()->addDays(7)->format('d/m/Y');
        $dropoffDate30Str = $pickupDateObj->copy()->addDays(30)->format('d/m/Y');

        $pickupTime = '10:00';
        $dropoffTime = '10:00';

        $this->info("Using pickup date: {$pickupDateStr} {$pickupTime}");

        // 5. Pre-load existing Wheelsys vehicles to strictly avoid overwriting
        // Assuming wheelsys tag: [WHEELSYS-GROUP-ID:XYZ]
        $allExistingVehicles = Vehicle::where('description', 'LIKE', '%[WHEELSYS-GROUP-ID:%')
            ->get();

        $existingVehiclesByTag = [];
        foreach ($allExistingVehicles as $v) {
            if (preg_match('/\[WHEELSYS-GROUP-ID:([^\]]+)\]/', $v->description, $m)) {
                $existingVehiclesByTag[$m[1]][$v->pickup_loc] = $v;
            }
        }

        $created = 0;
        $updated = 0;
        $skipped = 0;
        $seenVehicleIds = [];

        // 6. Process each branch sequentially
        $progress = $this->output->createProgressBar($allBranches->count());
        $progress->start();

        foreach ($allBranches as $branch) {
            $stationId = $branch->station_id;
            $country = $branch->country;

            $prices1 = $service->getAvailability($stationId, $stationId, $pickupDateStr, $pickupTime, $dropoffDate1Str, $dropoffTime, $country);
            $prices7 = $service->getAvailability($stationId, $stationId, $pickupDateStr, $pickupTime, $dropoffDate7Str, $dropoffTime, $country);
            $prices30 = $service->getAvailability($stationId, $stationId, $pickupDateStr, $pickupTime, $dropoffDate30Str, $dropoffTime, $country);

            // Merge prices
            foreach ($prices1 as $groupId => $data1) {
                $tag = "[WHEELSYS-GROUP-ID:{$groupId}]";

                $existingVehicle = $existingVehiclesByTag[$groupId][$branch->id] ?? null;

                $dayPrice = $data1['price'];
                if ($dayPrice <= 0) {
                    continue;
                }

                $weekPrice = isset($prices7[$groupId]) ? round($prices7[$groupId]['price'] / 7, 2) : $dayPrice;
                $monthPrice = isset($prices30[$groupId]) ? round($prices30[$groupId]['price'] / 30, 2) : $dayPrice;
                $currency = $data1['currency'];

                // Currency conversion
                $branchCurrency = $branch->currency;
                if (!empty($currency) && !empty($branchCurrency) && $currency !== $branchCurrency) {
                    $rate = \App\Models\CurrencyRate::where('currency_from', $currency)
                        ->where('currency_to', $branchCurrency)
                        ->first();
                    if ($rate) {
                        $dayPrice = round($dayPrice * $rate->rate, 2);
                        $weekPrice = round($weekPrice * $rate->rate, 2);
                        $monthPrice = round($monthPrice * $rate->rate, 2);
                        $currency = $branchCurrency;
                    }
                }

                if ($existingVehicle) {
                    $existingVehicle->update([
                        'price' => $dayPrice,
                        'week_price' => $weekPrice,
                        'month_price' => $monthPrice,
                        'instant_confirmation' => 1,
                        'activation' => 1,
                    ]);
                    $this->updatedCount++;
                    $seenVehicleIds[] = $existingVehicle->id;
                    continue;
                }

                if ($this->hasOption('prices-only') && $this->option('prices-only')) {
                    continue;
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

                $this->syncVehicleSpecifications($vehicle, $data1);
                $this->syncInclusions($vehicle, $data1['inclusions'] ?? []);

                // Mark as existing so we don't duplicate within same run if somehow repeated
                $existingVehiclesByTag[$groupId][$branch->id] = $vehicle;
                $seenVehicleIds[] = $vehicle->id;
                $this->createdCount++;
            }

            $progress->advance();
        }

        $progress->finish();

        // 7. Clean up branches without vehicles only in full sync mode
        if (!$this->hasOption('prices-only') || !$this->option('prices-only')) {
            foreach ($allBranches as $branch) {
                if ($branch->vehicles()->count() === 0) {
                    $branch->delete();
                    $this->deactivatedCount++;
                }
            }
        }

        // 8. Deactivate vehicles that were not seen in this sync run (handles stop-sell)
        $missingVehicles = $allExistingVehicles->whereNotIn('id', $seenVehicleIds);
        foreach ($missingVehicles as $mv) {
            if ($mv->activation) {
                $mv->update(['activation' => 0, 'price' => 0, 'week_price' => 0, 'month_price' => 0]);
                $this->deactivatedCount++;
            }
        }

        if ($this->createdCount > 0) {
            $created = $this->createdCount;
            try {
                \Illuminate\Support\Facades\Mail::raw(
                    "Automated Sync Alert: {$created} new vehicle(s) have been added from Wheelsys Supplier. Standard 5% profit margin assigned.",
                    function ($message) use ($created) {
                        $message->to(['admin@autours.net', 'contact@autours.net'])
                                ->subject("Wheelsys Sync Notification: {$created} New Vehicle(s) Added");
                    }
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send Wheelsys new vehicle notification email: " . $e->getMessage());
            }
        }

        return self::SUCCESS;
    }

    private function syncInclusions(Vehicle $vehicle, array $inclusions): void
    {
        $includedIds = [];
        foreach ($inclusions as $incText) {
            $incText = $this->mapInclusionName($incText);
            $inc = Included::firstOrCreate(['what_is_included' => $incText]);
            $includedIds[] = $inc->id;
        }
        if (!empty($includedIds)) {
            $vehicle->included()->syncWithoutDetaching($includedIds);
        }
    }

    private function mapInclusionName(string $code): string
    {
        return match ($code) {
            'CDW' => 'Collision Damage Waiver',
            'TP' => 'Theft Protection',
            'SCDW' => 'Super Collision Damage Waiver',
            'FI' => 'Ferry Insurance',
            'PAI' => 'Personal Accident Insurance',
            'WUG' => 'Wheels, Undercarriage and Glass protection',
            default => 'Included option (' . $code . ')',
        };
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
            return $url;
        }

        $cacheKey = $groupId . '|' . $url;
        if (array_key_exists($cacheKey, $this->imageCache)) {
            return $this->imageCache[$cacheKey];
        }

        $extension = pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'wheelsys_' . Str::slug($groupId) . '.' . $extension;
        $directory = public_path('img/vehicles');
        $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;

        if (file_exists($fullPath) && filesize($fullPath) > 0) {
            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        }

        try {
            $response = Http::timeout(15)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                Log::warning("Wheelsys image download failed", ['url' => $url]);
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

            $filename = 'wheelsys_' . Str::slug($groupId) . '.' . $extension;

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            $fullPath = $directory . DIRECTORY_SEPARATOR . $filename;
            file_put_contents($fullPath, $body);

            $this->imageCache[$cacheKey] = $filename;
            return $filename;
        } catch (\Exception $e) {
            Log::warning("Wheelsys image download exception", [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            $this->imageCache[$cacheKey] = null;
            return null;
        }
    }
}
