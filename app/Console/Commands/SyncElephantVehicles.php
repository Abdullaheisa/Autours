<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\ElephantApiService;
use Carbon\Carbon;
use App\Console\Commands\Base\AbstractVehicleSyncCommand;
use App\Console\Commands\Traits\NormalizesVehicleNames;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;
use App\Models\Specification;
use App\Models\VehicleSpecification;
use App\Services\SippDecoder;
use App\Models\RentalTerms;
use App\Models\SupplierRentalTerm;
use Illuminate\Support\Facades\Log;

class SyncElephantVehicles extends AbstractVehicleSyncCommand
{
    use ResolvesLocalVehiclePhoto, NormalizesVehicleNames;

    protected $signature = 'elephant:sync-vehicles
                            {--pickup-date= : Pickup date (MM-DD-YYYY), defaults to tomorrow}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles}';

    protected $description = 'Sync vehicles from Elephant (Cycar) API.';

    private ?array $specDefinitions = null;

    protected function getSupplierDisplayName(): string
    {
        return 'Elephant';
    }

    protected function performSync(): int
    {
        $supplierUser = User::where('email', 'info@elephantrentacar.com')->first();
        if (!$supplierUser || $supplierUser->integration_type !== 'elephant') {
            $this->warn('Elephant supplier not found or integration_type not set.');
            return self::FAILURE;
        }

        $service = new ElephantApiService($supplierUser->api_key, $supplierUser->api_password);

        $allBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotNull('station_id')
            ->get();

        if ($allBranches->isEmpty()) {
            $this->warn('No Elephant branches found with a station_id.');
            return self::FAILURE;
        }

        $this->loadSpecificationDefinitions();

        $pickupDate = $this->option('pickup-date') ?: Carbon::now()->addDays(30)->format('m/d/Y');
        
        $baseDate = Carbon::parse($pickupDate . ' 10:00 AM');
        
        $pickupDateTime = $baseDate->format('Y-m-d\TH:i:s');
        $dropoffDateTime1 = (clone $baseDate)->addDay()->format('Y-m-d\TH:i:s');
        $dropoffDateTime7 = (clone $baseDate)->addDays(7)->format('Y-m-d\TH:i:s');
        $dropoffDateTime30 = (clone $baseDate)->addDays(30)->format('Y-m-d\TH:i:s');

        $this->info("Using pickup: {$pickupDateTime}");
        $pricesOnly = $this->hasOption('prices-only') && $this->option('prices-only');
        
        $syncedVehicleIds = [];

        // Fetch Vehicle Groups to get details
        $vehicleGroups = [];
        try {
            $groupsData = $service->getVehicleGroups();
            foreach ($groupsData as $group) {
                if (isset($group['Group'])) {
                    $vehicleGroups[$group['Group']] = $group;
                }
            }
        } catch (\Exception $e) {
            $this->warn("Failed to get vehicle groups: " . $e->getMessage());
        }

        foreach ($allBranches as $branch) {
            $this->info("Fetching rates for branch: {$branch->station_id}");
            $rates1 = [];
            $rates7 = [];
            $rates30 = [];

            try {
                // 7 Days as base because Cycar has MinDays > 1
                $data7 = $service->getRateAvailability($branch->station_id, $branch->station_id, $pickupDateTime, $dropoffDateTime7);
                $rates7 = $this->extractRates($data7);

                // 30 Days
                $data30 = $service->getRateAvailability($branch->station_id, $branch->station_id, $pickupDateTime, $dropoffDateTime30);
                $rates30 = $this->extractRates($data30);
                
                // Fetch Extras to populate terms if possible, only for the first rate
                if (!empty($rates7) && !isset($termsPopulated)) {
                    $firstGroup = array_key_first($rates7);
                    $extras = $service->getExtrasAvailability($firstGroup, $baseDate->format('Y-m-d'), (clone $baseDate)->addDays(7)->format('Y-m-d'), $branch->station_id, $branch->station_id);
                    $this->populateTermsFromExtras($extras, $supplierUser, $branch->country ?? 'Cyprus');
                    $termsPopulated = true;
                }
                
            } catch (\Exception $e) {
                $this->warn("Could not fetch rates for branch {$branch->station_id}: " . $e->getMessage());
            }

            if (empty($rates7)) {
                $this->warn("No rates found for branch {$branch->station_id}. Deleting branch vehicles.");
                Vehicle::where('pickup_loc', $branch->id)->delete();
                $branch->delete();
                continue;
            }

            foreach ($rates7 as $groupCode => $rateInfo) {
                $groupDetails = $vehicleGroups[$groupCode] ?? [];
                $vehicleName = $this->normalizeVehicleName($groupDetails['ShortDescription'] ?? $rateInfo['MakeModel'] ?? $groupCode);
                
                $weekPrice = $rateInfo['RateCharge'];
                $dayPrice = round($weekPrice / 7, 2);
                $monthPrice = $rates30[$groupCode]['RateCharge'] ?? ($dayPrice * 30);
                
                if ($monthPrice > $dayPrice * 15 && $monthPrice > 500) {
                    $monthPrice = round($monthPrice / 30, 2);
                }

                $tag = "[ELEPHANT-GROUP-ID:{$groupCode}]";
                
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
                    $this->syncVehicleSpecifications($vehicle, $groupDetails);
                    $this->syncVehicleInclusions($vehicle, $groupDetails);
                    $syncedVehicleIds[] = $vehicle->id;
                    $this->updatedCount++;
                } else {
                    if ($pricesOnly) continue;

                    $photoFilename = $this->resolveLocalPhoto($vehicleName);
                    
                    // Fallback to SIPP mapping for category
                    $sipp = $groupDetails['Sipp'] ?? '';
                    
                    $vehicle = Vehicle::create([
                        'name' => $vehicleName,
                        'description' => $tag . ' ' . ($groupDetails['LongDescription'] ?? $vehicleName),
                        'photo' => $photoFilename,
                        'supplier' => $supplierUser->id,
                        'activation' => true,
                        'pickup_loc' => $branch->id,
                        'category' => $this->resolveCategoryFromSipp($sipp),
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

                    $this->syncVehicleSpecifications($vehicle, $groupDetails);
                    $this->syncVehicleInclusions($vehicle, $groupDetails);
                    $syncedVehicleIds[] = $vehicle->id;
                    $this->createdCount++;
                }
            }
        }

        // Clean up orphaned vehicles not seen in this sync
        if (!$pricesOnly && !empty($syncedVehicleIds)) {
            $orphaned = Vehicle::where('supplier', $supplierUser->id)
                ->whereNotIn('id', $syncedVehicleIds)
                ->get();

            foreach ($orphaned as $ov) {
                $ov->delete();
                $this->deactivatedCount++;
            }
            if ($this->deactivatedCount > 0) {
                $this->info("Deactivated {$this->deactivatedCount} orphaned Elephant vehicles.");
            }
        }

        return self::SUCCESS;
    }

    private function extractRates(array $data): array
    {
        $rates = [];
        // Elephant GetRateAvailability returns an array of objects
        foreach ($data as $item) {
            $group = $item['VehicleGroup']['Group'] ?? '';
            $price = $item['Charges']['Calculation']['TotalAmount'] ?? 0;
            if ($group && $price > 0) {
                $rates[$group] = [
                    'RateCharge' => (float)$price,
                    'MakeModel' => $item['VehicleGroup']['ShortDescription'] ?? $group,
                    'RawData' => $item,
                ];
            }
        }
        return $rates;
    }

    private function populateTermsFromExtras(array $extras, User $supplierUser, string $country): void
    {
        $termsAdded = 0;
        foreach ($extras as $extra) {
            if (!empty($extra['AdditionalInfo'])) {
                $title = $extra['DescriptionTranslated'] ?? $extra['Description'] ?? 'Extra Information';
                $description = strip_tags($extra['AdditionalInfo']);
                
                $term = RentalTerms::updateOrCreate(
                    [
                        'title' => $title,
                        'created_by' => $supplierUser->id,
                        'country' => $country,
                    ],
                    [
                        'description' => $description,
                        'status' => 'approved',
                    ]
                );

                SupplierRentalTerm::firstOrCreate([
                    'rental_term_id' => $term->id,
                    'supplier_id' => $supplierUser->id,
                    'country' => $country,
                ]);

                $termsAdded++;
            }
        }
        $this->info("Successfully saved {$termsAdded} terms/policies from extras for {$country}.");
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

    private function syncVehicleSpecifications(Vehicle $vehicle, array $groupDetails): void
    {
        VehicleSpecification::where('vehicle_id', $vehicle->id)->delete();

        $records = [];
        $now = Carbon::now()->toDateTimeString();

        $trans = $groupDetails['Transmition'] ?? null;
        if ($trans && isset($this->specDefinitions['Transmission'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Transmission',
                'value' => ucfirst(strtolower($trans)),
                'icon' => $this->specDefinitions['Transmission']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $ac = $groupDetails['AirCondition'] ?? null;
        if (isset($this->specDefinitions['Air Conditioner'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Air Conditioner',
                'value' => $ac ? 'Air Conditioning' : 'No AC',
                'icon' => $this->specDefinitions['Air Conditioner']['icon'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $bags = $groupDetails['Luggages'] ?? null;
        if ($bags !== null) {
            if (isset($this->specDefinitions['Suitcase'])) {
                $suitcaseVal = (int)$bags > 1 ? 'Large' : 'Medium';
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Suitcase',
                    'value' => $suitcaseVal,
                    'icon' => $this->specDefinitions['Suitcase']['icon'] ?? 'suitcase',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (isset($this->specDefinitions['Number of Luggages'])) {
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Number of Luggages',
                    'value' => (string)$bags,
                    'icon' => $this->specDefinitions['Number of Luggages']['icon'] ?? 'suitcase',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        $seats = $groupDetails['Passengers'] ?? null;
        if ($seats !== null) {
            if (isset($this->specDefinitions['Number of seats'])) {
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Number of seats',
                    'value' => (string)$seats,
                    'icon' => $this->specDefinitions['Number of seats']['icon'] ?? 'user',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (isset($this->specDefinitions['Number of Adults'])) {
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Number of Adults',
                    'value' => (string)$seats,
                    'icon' => $this->specDefinitions['Number of Adults']['icon'] ?? 'user',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        $fuel = $groupDetails['FuelType'] ?? null;
        if ($fuel) {
            $fuelType = stripos($fuel, 'diesel') !== false ? 'Diesel' : 'Petrol';
            if (isset($this->specDefinitions['Fuel Type'])) {
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Fuel Type',
                    'value' => $fuelType,
                    'icon' => $this->specDefinitions['Fuel Type']['icon'] ?? 'fuel',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            if (isset($this->specDefinitions['Fuel'])) {
                $records[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Fuel',
                    'value' => $fuelType,
                    'icon' => $this->specDefinitions['Fuel']['icon'] ?? 'fuel',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }
        
        $sipp = $groupDetails['Sipp'] ?? '';
        $doors = '4';
        if (strlen($sipp) >= 2) {
            $char = strtoupper($sipp[1]);
            if (in_array($char, ['B', 'C'])) $doors = '2';
            else if (in_array($char, ['D', 'F', 'W', 'V'])) $doors = '5';
        }

        if (isset($this->specDefinitions['Doors'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Doors',
                'value' => $doors,
                'icon' => $this->specDefinitions['Doors']['icon'] ?? 'door',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        if (isset($this->specDefinitions['Number of Doors'])) {
            $records[] = [
                'vehicle_id' => $vehicle->id,
                'name' => 'Number of Doors',
                'value' => $doors,
                'icon' => $this->specDefinitions['Number of Doors']['icon'] ?? 'door',
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if (!empty($records)) {
            VehicleSpecification::insert($records);
        }
    }

    private function syncVehicleInclusions(Vehicle $vehicle, array $groupDetails): void
    {
        $includedIds = [];

        $standardCoverages = [
            'Collision Damage Waiver',
            'Third Party Liability',
            'Theft Protection',
            'Airport surcharges and local taxes',
            'Unlimited Mileage'
        ];
        
        foreach ($standardCoverages as $cov) {
            $inc = \App\Models\Included::firstOrCreate(['what_is_included' => $cov]);
            $includedIds[] = $inc->id;
        }

        if (!empty($includedIds)) {
            $vehicle->included()->syncWithoutDetaching($includedIds);
        }
    }

    private function resolveCategoryFromSipp(string $sipp): ?int
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
