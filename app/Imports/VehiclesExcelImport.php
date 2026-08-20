<?php

namespace App\Imports;

use App\Models\Category;
use App\Models\FuelPolicy;
use App\Models\Included;
use App\Models\LocationType;
use App\Models\LocationTypeVehicle;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\VehicleIncluded;
use App\Models\VehicleSpecification;
use App\Models\VehiclesPhotos;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class VehiclesExcelImport implements ToCollection, WithMultipleSheets
{
    /**
     * Legacy Column Indices fallback
     */
    private const COL_ROW_NUMBER = 0;
    private const COL_VEHICLE_NAME = 1;
    private const COL_CATEGORY = 2;
    private const COL_AIR_CONDITION = 3;
    private const COL_DOORS = 4;
    private const COL_SUITCASE = 5;
    private const COL_SEATS = 6;
    private const COL_FUEL = 7;
    private const COL_TRANSMISSION = 8;
    private const COL_LOCATION_TYPE = 9;
    private const COL_FUEL_POLICY = 10;
    private const COL_CONFIRMATION_TYPE = 12;
    private const COL_PRICE_1_3_DAYS = 15;
    private const COL_PRICE_WEEK = 16;
    private const COL_PRICE_MONTH = 17;
    private const COL_DESCRIPTION = 18;

    private const SHEET_VEHICLES = 0;
    private const SHEET_INCLUDED = 1;
    private const AC_KEYWORDS = ['air', 'condition', 'ac', 'a/c'];

    public int $branchId;
    public int $supplierId;
    public array $vehicleIds = [];
    public array $errors = [];

    /**
     * Dynamic Header Map (header_key => column_index or array info)
     */
    protected array $headerMap = [];
    protected array $customRangeHeaders = [];

    public function __construct(int $branchId, int $supplierId)
    {
        $this->branchId = $branchId;
        $this->supplierId = $supplierId;
    }

    public function getVehicleIds(): array
    {
        return $this->vehicleIds;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function sheets(): array
    {
        return [
            self::SHEET_VEHICLES => $this,
            self::SHEET_INCLUDED => $this,
        ];
    }

    public function collection(Collection $collection)
    {
        if (empty($this->vehicleIds)) {
            $this->vehicleIds = $this->processVehiclesSheet(collect($collection));
        } else {
            $this->processIncludedSheet(collect($collection));
        }
    }

    /**
     * Process the vehicles sheet with Smart Header Mapping
     */
    protected function processVehiclesSheet(Collection $collection): array
    {
        $vehicleIds = [];
        $headerSkipped = false;

        info("=== Starting Smart Vehicle Import ===");
        info("Total rows in collection: " . $collection->count());

        foreach ($collection as $rowIndex => $row) {
            // Process row 0 to map headers dynamically
            if (!$headerSkipped) {
                $headerSkipped = true;
                if ($this->isHeaderRow($row)) {
                    $this->parseHeaders($row);
                    info("Header mapping parsed: " . json_encode($this->headerMap));
                    continue;
                }
            }

            if (!$this->isValidDataRow($row)) {
                info("Row {$rowIndex}: Skipped (invalid data row)");
                continue;
            }

            $vehicleName = $this->getCellValue($row, 'vehicle_name', self::COL_VEHICLE_NAME);
            if (empty($vehicleName)) {
                info("Row {$rowIndex}: Skipped (empty vehicle name)");
                continue;
            }

            $rowNumber = $rowIndex + 1;
            info("Row {$rowNumber}: Processing vehicle - Name: " . $vehicleName);

            $errorCountBefore = count($this->errors);
            $vehicle = $this->createVehicleFromRow($row, $rowNumber);

            if ($vehicle === null) {
                info("Row {$rowNumber}: Vehicle creation returned null");
                continue;
            }

            $errorCountAfter = count($this->errors);
            if ($errorCountAfter > $errorCountBefore) {
                info("Row {$rowNumber}: Skipped due to errors");
                continue;
            }

            $vehicle->save();
            $vehicleIds[] = $vehicle->id;
            info("Row {$rowNumber}: Vehicle saved with ID: " . $vehicle->id);

            $this->processVehicleSpecifications($vehicle, $row);
            $this->processLocationType($vehicle, $row);
            $this->processFuelPolicy($vehicle, $row);
        }

        return $vehicleIds;
    }

    /**
     * Parse and map headers dynamically from row 0
     */
    protected function parseHeaders(Collection|array $headerRow): void
    {
        $this->headerMap = [];
        $this->customRangeHeaders = [];

        foreach ($headerRow as $index => $cellValue) {
            if (empty($cellValue)) continue;
            $cleanHeader = strtolower(trim((string)$cellValue));

            if (str_contains($cleanHeader, 'row #') || $cleanHeader === 'row') {
                $this->headerMap['row_number'] = $index;
            } elseif (str_contains($cleanHeader, 'vehicle name') || str_contains($cleanHeader, 'car name') || $cleanHeader === 'name') {
                $this->headerMap['vehicle_name'] = $index;
            } elseif (str_contains($cleanHeader, 'category')) {
                $this->headerMap['category'] = $index;
            } elseif (str_contains($cleanHeader, 'air') || str_contains($cleanHeader, 'ac')) {
                $this->headerMap['air_condition'] = $index;
            } elseif (str_contains($cleanHeader, 'door')) {
                $this->headerMap['doors'] = $index;
            } elseif (str_contains($cleanHeader, 'suitcase') || str_contains($cleanHeader, 'luggage')) {
                $this->headerMap['suitcase'] = $index;
            } elseif (str_contains($cleanHeader, 'seat')) {
                $this->headerMap['seats'] = $index;
            } elseif (str_contains($cleanHeader, 'fuel type') || $cleanHeader === 'fuel') {
                $this->headerMap['fuel_type'] = $index;
            } elseif (str_contains($cleanHeader, 'transmission')) {
                $this->headerMap['transmission'] = $index;
            } elseif (str_contains($cleanHeader, 'location type')) {
                $this->headerMap['location_type'] = $index;
            } elseif (str_contains($cleanHeader, 'fuel policy')) {
                $this->headerMap['fuel_policy'] = $index;
            } elseif (str_contains($cleanHeader, 'confirmation')) {
                $this->headerMap['confirmation'] = $index;
            } elseif (str_contains($cleanHeader, 'pricing mode') || $cleanHeader === 'mode') {
                $this->headerMap['pricing_mode'] = $index;
            } elseif (str_contains($cleanHeader, 'custom price ranges') || str_contains($cleanHeader, 'custom tiers')) {
                $this->headerMap['custom_tiers_json'] = $index;
            } elseif (str_contains($cleanHeader, 'description')) {
                $this->headerMap['description'] = $index;
            }

            // Match standard and granular price columns first
            if (str_contains($cleanHeader, 'price (1-2') || str_contains($cleanHeader, 'price 1-2')) {
                $this->headerMap['price_1_2'] = $index;
            } elseif (str_contains($cleanHeader, 'price (3-4') || str_contains($cleanHeader, 'price 3-4')) {
                $this->headerMap['price_3_4'] = $index;
            } elseif (str_contains($cleanHeader, 'price (5-7') || str_contains($cleanHeader, 'week price')) {
                $this->headerMap['price_5_7'] = $index;
            } elseif (str_contains($cleanHeader, 'price (8-14') || str_contains($cleanHeader, 'price 8-14')) {
                $this->headerMap['price_8_14'] = $index;
            } elseif (str_contains($cleanHeader, 'price (15-30') || str_contains($cleanHeader, 'month price')) {
                $this->headerMap['price_15_30'] = $index;
            } elseif (str_contains($cleanHeader, 'price (1-3') || str_contains($cleanHeader, 'price 1-3') || str_contains($cleanHeader, 'daily price')) {
                $this->headerMap['price_1_3'] = $index;
            } elseif (preg_match('/price\s*\(?\s*(\d+)\s*-\s*(\d+)\s*(?:days?)?\s*\)?/i', $cleanHeader, $matches)) {
                // Custom dynamic range match (e.g. 1-4, 5-10, 11-30)
                $min = (int)$matches[1];
                $max = (int)$matches[2];
                $this->customRangeHeaders[] = [
                    'index' => $index,
                    'min' => $min,
                    'max' => $max,
                    'header' => (string)$cellValue
                ];
            }
        }
    }

    protected function getCellValue(Collection|array $row, string $key, int $fallbackIndex): ?string
    {
        if (isset($this->headerMap[$key]) && isset($row[$this->headerMap[$key]])) {
            $val = trim((string)$row[$this->headerMap[$key]]);
            if ($val !== '') return $val;
        }
        if (isset($row[$fallbackIndex])) {
            $val = trim((string)$row[$fallbackIndex]);
            if ($val !== '') return $val;
        }
        return null;
    }

    protected function isValidDataRow(Collection|array $row): bool
    {
        $rowNumIdx = $this->headerMap['row_number'] ?? self::COL_ROW_NUMBER;
        if (is_numeric($row[$rowNumIdx] ?? null)) {
            return true;
        }

        $vName = $this->getCellValue($row, 'vehicle_name', self::COL_VEHICLE_NAME);
        if (!empty($vName) && !$this->isHeaderRowValue($vName)) {
            return true;
        }

        return false;
    }

    protected function isHeaderRow(Collection|array $row): bool
    {
        foreach ($row as $cell) {
            if ($cell && $this->isHeaderRowValue((string)$cell)) {
                return true;
            }
        }
        return false;
    }

    protected function isHeaderRowValue($value): bool
    {
        $headerKeywords = ['vehicle', 'name', 'car', 'model', 'category', 'row #', 'air condition'];
        $lowerValue = strtolower(trim((string)$value));

        foreach ($headerKeywords as $keyword) {
            if (str_contains($lowerValue, $keyword)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create Vehicle from Row with Smart Pricing Engine
     */
    protected function createVehicleFromRow(Collection|array $row, int $rowNumber): ?Vehicle
    {
        $vehicle = new Vehicle();
        $vehicleName = $this->getCellValue($row, 'vehicle_name', self::COL_VEHICLE_NAME);

        $vehicle->name = $vehicleName;
        $vehicle->pickup_loc = $this->branchId;
        $vehicle->supplier = $this->supplierId;
        $vehicle->activation = true;

        $confVal = $this->getCellValue($row, 'confirmation', self::COL_CONFIRMATION_TYPE);
        $vehicle->instant_confirmation = $this->isInstantConfirmation($confVal);

        $description = $this->getCellValue($row, 'description', self::COL_DESCRIPTION);
        if (!empty($description)) {
            $vehicle->description = $description;
        }

        $this->setVehiclePhoto($vehicle, $vehicleName, $rowNumber);
        
        $catVal = $this->getCellValue($row, 'category', self::COL_CATEGORY);
        $this->setVehicleCategory($vehicle, $catVal, $rowNumber);

        // Smart Pricing calculation
        $this->setSmartVehiclePricing($vehicle, $row, $rowNumber);

        return $vehicle;
    }

    protected function setVehiclePhoto(Vehicle $vehicle, ?string $vehicleName, int $rowNumber): void
    {
        if (empty($vehicleName)) {
            $vehicle->photo = null;
            return;
        }

        $cleanName = trim($vehicleName);

        $photo = VehiclesPhotos::query()
            ->where('name', 'like', '%' . $cleanName . '%')
            ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($cleanName) . '%'])
            ->first();

        if ($photo === null) {
            $parts = preg_split('/\s+/', $cleanName);
            if (count($parts) >= 2) {
                $twoWords = $parts[0] . ' ' . $parts[1];
                $photo = VehiclesPhotos::query()
                    ->where('name', 'like', '%' . $twoWords . '%')
                    ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($twoWords) . '%'])
                    ->first();
            }
        }

        if ($photo === null) {
            $allPhotos = VehiclesPhotos::query()->get();
            foreach ($allPhotos as $p) {
                if (!empty($p->name) && stripos($cleanName, trim($p->name)) !== false) {
                    $photo = $p;
                    break;
                }
            }
        }

        if ($photo !== null) {
            $vehicle->photo = $photo->photo ?: (string)$photo->id;
        } else {
            $vehicle->photo = null;
        }
    }

    protected function setVehicleCategory(Vehicle $vehicle, ?string $categoryName, int $rowNumber): void
    {
        if (empty($categoryName)) {
            $vehicle->category = null;
            return;
        }

        $category = Category::query()
            ->where('name', 'like', '%' . trim($categoryName) . '%')
            ->first();

        $vehicle->category = $category?->id;
    }

    /**
     * Smart Pricing Engine: Detects Standard, Granular, and Custom Price Range Columns
     */
    protected function setSmartVehiclePricing(Vehicle $vehicle, Collection|array $row, int $rowNumber): void
    {
        $explicitMode = strtolower(trim((string)($this->getCellValue($row, 'pricing_mode', -1) ?? '')));
        $customJsonStr = $this->getCellValue($row, 'custom_tiers_json', -1);

        // 1. Check if explicit JSON custom tiers column is provided
        if (!empty($customJsonStr)) {
            $decodedTiers = json_decode($customJsonStr, true);
            if (is_array($decodedTiers) && count($decodedTiers) > 0) {
                $vehicle->pricing_mode = 'dynamic';
                $vehicle->custom_price_tiers = $decodedTiers;
                $vehicle->price = $this->parsePrice($decodedTiers[0]['price'] ?? 0) ?? 0;
                $vehicle->week_price = $this->parsePrice($decodedTiers[1]['price'] ?? $vehicle->price);
                $vehicle->month_price = $this->parsePrice(end($decodedTiers)['price'] ?? $vehicle->week_price);
                return;
            }
        }

        // 2. Check if custom Price (X-Y Days) headers were detected
        if (!empty($this->customRangeHeaders)) {
            $dynamicTiers = [];
            foreach ($this->customRangeHeaders as $rangeInfo) {
                $rawVal = $row[$rangeInfo['index']] ?? null;
                $parsedP = $this->parsePrice($rawVal);
                if ($parsedP !== null && $parsedP > 0) {
                    $dynamicTiers[] = [
                        'id' => 'tier_' . $rangeInfo['min'] . '_' . $rangeInfo['max'],
                        'minDays' => $rangeInfo['min'],
                        'maxDays' => $rangeInfo['max'],
                        'price' => (string)$parsedP,
                    ];
                }
            }

            if (count($dynamicTiers) > 0) {
                $vehicle->pricing_mode = 'dynamic';
                $vehicle->custom_price_tiers = $dynamicTiers;
                $vehicle->price = (float)$dynamicTiers[0]['price'];
                $vehicle->week_price = isset($dynamicTiers[1]) ? (float)$dynamicTiers[1]['price'] : $vehicle->price;
                $vehicle->month_price = (float)end($dynamicTiers)['price'];
                return;
            }
        }

        // 3. Check for 5 Granular Pricing columns
        $p12  = $this->parsePrice($this->getCellValue($row, 'price_1_2', -1));
        $p34  = $this->parsePrice($this->getCellValue($row, 'price_3_4', -1));
        $p57  = $this->parsePrice($this->getCellValue($row, 'price_5_7', self::COL_PRICE_WEEK));
        $p814 = $this->parsePrice($this->getCellValue($row, 'price_8_14', -1));
        $p1530= $this->parsePrice($this->getCellValue($row, 'price_15_30', self::COL_PRICE_MONTH));

        if ($explicitMode === 'granular' || ($p34 !== null || $p814 !== null)) {
            $p12Final = $p12 ?? $this->parsePrice($row[self::COL_PRICE_1_3_DAYS] ?? null) ?? 0;
            $vehicle->pricing_mode = 'granular';
            $vehicle->granular_prices = [
                'price_1_2'  => (string)($p12Final),
                'price_3_4'  => (string)($p34 ?? $p12Final),
                'price_5_7'  => (string)($p57 ?? $p34 ?? $p12Final),
                'price_8_14' => (string)($p814 ?? $p57 ?? $p12Final),
                'price_15_30'=> (string)($p1530 ?? $p814 ?? $p12Final),
            ];

            $vehicle->price = (float)$p12Final;
            $vehicle->week_price = (float)($p57 ?? $p34 ?? $p12Final);
            $vehicle->month_price = (float)($p1530 ?? $p814 ?? $vehicle->week_price);
            return;
        }

        // 4. Default Standard Pricing Model (1-3 Days / Week / Month)
        $dailyPrice = $p12 ?? $this->parsePrice($row[self::COL_PRICE_1_3_DAYS] ?? null);
        $weekPrice  = $p57 ?? $this->parsePrice($row[self::COL_PRICE_WEEK] ?? null);
        $monthPrice = $p1530 ?? $this->parsePrice($row[self::COL_PRICE_MONTH] ?? null);

        if (!$this->isValidPrice($dailyPrice)) {
            $this->addError($rowNumber, "Price is required and must be greater than 0");
        }

        $vehicle->pricing_mode = !empty($explicitMode) ? $explicitMode : 'standard';
        $vehicle->price = $dailyPrice ?? 0;
        $vehicle->week_price = $weekPrice;
        $vehicle->month_price = $monthPrice;
    }

    protected function parsePrice($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        $cleaned = preg_replace('/[^0-9.,]/', '', (string)$value);
        $cleaned = str_replace(',', '.', $cleaned);
        if ($cleaned === '' || !is_numeric($cleaned)) {
            return null;
        }
        return (float)$cleaned;
    }

    protected function isValidPrice($price): bool
    {
        return !empty($price) && $price > 0;
    }

    protected function isInstantConfirmation(?string $confirmationType): int
    {
        return str_contains(strtolower($confirmationType ?? ''), 'instant') ? 1 : 0;
    }

    protected function processVehicleSpecifications(Vehicle $vehicle, Collection|array $row): void
    {
        $acVal   = $this->getCellValue($row, 'air_condition', self::COL_AIR_CONDITION);
        $doorVal = $this->getCellValue($row, 'doors', self::COL_DOORS);
        $suitVal = $this->getCellValue($row, 'suitcase', self::COL_SUITCASE);
        $seatVal = $this->getCellValue($row, 'seats', self::COL_SEATS);
        $fuelVal = $this->getCellValue($row, 'fuel_type', self::COL_FUEL);
        $transVal= $this->getCellValue($row, 'transmission', self::COL_TRANSMISSION);

        $this->addAirConditionSpec($vehicle, $acVal);
        $this->addDoorsSpec($vehicle, $doorVal);
        $this->addSuitcaseSpec($vehicle, $suitVal);
        $this->addSeatsSpec($vehicle, $seatVal);
        $this->addFuelSpec($vehicle, $fuelVal);
        $this->addTransmissionSpec($vehicle, $transVal);
    }

    protected function addAirConditionSpec(Vehicle $vehicle, ?string $value): void
    {
        if (empty($value)) return;
        $acValue = $this->parseAirConditionValue($value);
        if ($acValue === null) return;
        $spec = $this->findSpecification('air');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $acValue, $spec->icon);
        }
    }

    protected function addDoorsSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value) && $value !== '0' && $value !== 0) return;
        $num = preg_replace('/[^0-9]/', '', (string)$value);
        $finalValue = !empty($num) ? $num : (string)$value;
        $spec = $this->findSpecification('door');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $finalValue, $spec->icon);
        }
    }

    protected function addSuitcaseSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value) && $value !== '0' && $value !== 0) return;
        $valStr = strtolower(trim((string)$value));

        if ($valStr === '1' || str_contains($valStr, 'small')) {
            $normalized = 'Small';
        } elseif ($valStr === '2' || str_contains($valStr, 'medium')) {
            $normalized = 'Medium';
        } elseif ($valStr === '3' || str_contains($valStr, 'large')) {
            $normalized = 'Large';
        } else {
            $normalized = ucfirst($valStr);
        }

        $spec = $this->findSpecification('suitcase');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $normalized, $spec->icon);
        }
    }

    protected function addSeatsSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value) && $value !== '0' && $value !== 0) return;
        $num = preg_replace('/[^0-9]/', '', (string)$value);
        $finalValue = !empty($num) ? $num : (string)$value;

        $spec = $this->findSpecification('seat');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $finalValue, $spec->icon);
        }
    }

    protected function addFuelSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value)) return;
        $valStr = strtolower(trim((string)$value));

        if (str_contains($valStr, 'gas') || str_contains($valStr, 'petrol') || str_contains($valStr, 'gasoline')) {
            $normalized = 'Gas';
        } elseif (str_contains($valStr, 'diesel')) {
            $normalized = 'Diesel';
        } elseif (str_contains($valStr, 'hybrid')) {
            $normalized = 'Hybrid';
        } elseif (str_contains($valStr, 'electric')) {
            $normalized = 'Electric';
        } else {
            $normalized = ucfirst($valStr);
        }

        $spec = $this->findSpecification('fuel');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $normalized, $spec->icon);
        }
    }

    protected function addTransmissionSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value)) return;
        $valStr = strtolower(trim((string)$value));

        if (str_contains($valStr, 'auto')) {
            $normalized = 'Automatic';
        } elseif (str_contains($valStr, 'manual')) {
            $normalized = 'Manual';
        } else {
            $normalized = ucfirst($valStr);
        }

        $spec = $this->findSpecification('transmission');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $normalized, $spec->icon);
        }
    }

    protected function parseAirConditionValue(string $value): ?string
    {
        $lower = strtolower(trim($value));
        foreach (self::AC_KEYWORDS as $keyword) {
            if (str_contains($lower, $keyword)) {
                return 'Air Conditioning';
            }
        }
        if (in_array($lower, ['yes', '1', 'true', 'y'])) {
            return 'Air Conditioning';
        }
        return null;
    }

    protected function findSpecification(string $keyword): ?Specification
    {
        return Specification::query()
            ->where('name', 'like', '%' . $keyword . '%')
            ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($keyword) . '%'])
            ->first();
    }

    protected function createVehicleSpecification(int $vehicleId, string $name, $value, ?string $icon): void
    {
        VehicleSpecification::query()->insert([
            'vehicle_id' => $vehicleId,
            'name' => $name,
            'value' => $value,
            'icon' => $icon ?? 'Settings',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function processLocationType(Vehicle $vehicle, Collection|array $row): void
    {
        $locTypeVal = $this->getCellValue($row, 'location_type', self::COL_LOCATION_TYPE);
        if (empty($locTypeVal)) return;

        $locationType = LocationType::query()
            ->where('name', 'like', '%' . trim($locTypeVal) . '%')
            ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower(trim($locTypeVal)) . '%'])
            ->first();

        if ($locationType) {
            LocationTypeVehicle::query()->insert([
                'vehicle_id' => $vehicle->id,
                'location_type_id' => $locationType->id,
            ]);
        }
    }

    protected function processFuelPolicy(Vehicle $vehicle, Collection|array $row): void
    {
        $fpVal = $this->getCellValue($row, 'fuel_policy', self::COL_FUEL_POLICY);
        if (empty($fpVal)) return;

        $fuelPolicy = FuelPolicy::query()
            ->where('name', 'like', '%' . trim($fpVal) . '%')
            ->first();

        if ($fuelPolicy) {
            $vehicle->fuel_policy_id = $fuelPolicy->id;
            $vehicle->save();
        }
    }

    protected function processIncludedSheet(Collection $collection): void
    {
        info("=== Processing Included Sheet ===");
        info("Total rows in included collection: " . $collection->count());

        if (empty($this->vehicleIds)) {
            info("No vehicle IDs available for included processing");
            return;
        }

        $headerSkipped = false;
        foreach ($collection as $rowIndex => $row) {
            if (!$headerSkipped) {
                $headerSkipped = true;
                continue;
            }

            $includedName = trim((string)($row[0] ?? ''));
            if (empty($includedName)) continue;

            $included = Included::query()
                ->where('what_is_included', 'like', '%' . $includedName . '%')
                ->first();

            if ($included) {
                foreach ($this->vehicleIds as $vId) {
                    $exists = VehicleIncluded::query()
                        ->where('vehicle_id', $vId)
                        ->where('included_id', $included->id)
                        ->exists();

                    if (!$exists) {
                        VehicleIncluded::query()->insert([
                            'vehicle_id' => $vId,
                            'included_id' => $included->id,
                        ]);
                    }
                }
            }
        }
    }

    protected function addError(int $rowNumber, string $message): void
    {
        $this->errors[] = "Row {$rowNumber}: {$message}";
    }
}
