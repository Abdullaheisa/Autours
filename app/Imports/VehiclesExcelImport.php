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
     * Column indices for the Vehicles sheet
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
    private const COL_RESERVED_11 = 11;
    private const COL_CONFIRMATION_TYPE = 12;
    private const COL_RESERVED_13 = 13;
    private const COL_RESERVED_14 = 14;
    private const COL_PRICE_1_3_DAYS = 15;
    private const COL_PRICE_WEEK = 16;
    private const COL_PRICE_MONTH = 17;
    private const COL_DESCRIPTION = 18;

    /**
     * Sheet indices
     */
    private const SHEET_VEHICLES = 0;
    private const SHEET_INCLUDED = 1;

    /**
     * Air conditioning keywords
     */
    private const AC_KEYWORDS = ['air', 'condition', 'ac', 'a/c'];

    protected int $branchId;
    protected int $supplierId;
    protected array $vehicleIds = [];
    protected array $errors = [];

    public function __construct(int $branchId, int $supplierId)
    {
        $this->branchId = $branchId;
        $this->supplierId = $supplierId;
    }

    /**
     * Get vehicle IDs after import
     */
    public function getVehicleIds(): array
    {
        return $this->vehicleIds;
    }

    /**
     * Get errors after import
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Define which sheets to import
     */
    public function sheets(): array
    {
        return [
            self::SHEET_VEHICLES => $this,
            self::SHEET_INCLUDED => $this,
        ];
    }

    /**
     * Process each sheet collection
     */
    public function collection(Collection $collection)
    {
        if (empty($this->vehicleIds)) {
            $this->vehicleIds = $this->processVehiclesSheet(collect($collection));
        } else {
            $this->processIncludedSheet(collect($collection));
        }
    }

    /**
     * Process the vehicles sheet and create vehicle records
     */
    protected function processVehiclesSheet(Collection $collection): array
    {
        $vehicleIds = [];
        $headerSkipped = false;

        info("=== Starting Vehicle Import ===");
        info("Total rows in collection: " . $collection->count());

        foreach ($collection as $rowIndex => $row) {
            // Skip header row (first row or row with text in first column)
            if (!$headerSkipped) {
                $headerSkipped = true;
                if (!$this->isValidDataRow($row)) {
                    info("Row {$rowIndex}: Skipped (header row)");
                    continue;
                }
            }

            if (!$this->isValidDataRow($row)) {
                info("Row {$rowIndex}: Skipped (invalid data row) - Col0: " . ($row[0] ?? 'null') . ", Col1: " . ($row[1] ?? 'null'));
                continue;
            }

            // Skip rows with empty vehicle name silently (template empty rows)
            $vehicleName = trim($row[self::COL_VEHICLE_NAME] ?? '');
            if (empty($vehicleName)) {
                info("Row {$rowIndex}: Skipped (empty vehicle name)");
                continue;
            }

            $rowNumber = $rowIndex + 1;
            info("Row {$rowNumber}: Processing vehicle - Name: " . ($row[self::COL_VEHICLE_NAME] ?? 'null'));

            // Track errors before this row
            $errorCountBefore = count($this->errors);

            $vehicle = $this->createVehicleFromRow($row, $rowNumber);

            if ($vehicle === null) {
                info("Row {$rowNumber}: Vehicle creation returned null");
                continue;
            }

            // Check if this row had errors - skip saving but continue processing
            $errorCountAfter = count($this->errors);
            if ($errorCountAfter > $errorCountBefore) {
                // Row had errors, don't save but continue with next row
                info("Row {$rowNumber}: Skipped due to errors - " . json_encode(array_slice($this->errors, $errorCountBefore)));
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
     * Check if the row contains valid data
     * A row is valid if it has a numeric row number OR has a vehicle name
     */
    protected function isValidDataRow(Collection|array $row): bool
    {
        // Check if first column is numeric (row number)
        if (is_numeric($row[self::COL_ROW_NUMBER] ?? null)) {
            return true;
        }

        // Also accept rows where vehicle name is not empty (flexible format)
        $vehicleName = $row[self::COL_VEHICLE_NAME] ?? null;
        if (!empty($vehicleName) && !$this->isHeaderRow($vehicleName)) {
            return true;
        }

        return false;
    }

    /**
     * Check if this looks like a header row
     */
    protected function isHeaderRow($value): bool
    {
        $headerKeywords = ['vehicle', 'name', 'car', 'model', 'category', 'row'];
        $lowerValue = strtolower(trim($value));

        foreach ($headerKeywords as $keyword) {
            if (str_contains($lowerValue, $keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Create a new Vehicle instance from row data
     */
    protected function createVehicleFromRow(Collection|array $row, int $rowNumber): ?Vehicle
    {
        $vehicle = new Vehicle();
        $vehicleName = $row[self::COL_VEHICLE_NAME];

        $vehicle->name = $vehicleName;
        $vehicle->pickup_loc = $this->branchId;
        $vehicle->supplier = $this->supplierId;
        $vehicle->activation = true;
        $vehicle->instant_confirmation = $this->isInstantConfirmation($row[self::COL_CONFIRMATION_TYPE]);

        // Set description (optional)
        $description = trim($row[self::COL_DESCRIPTION] ?? '');
        if (!empty($description)) {
            $vehicle->description = $description;
        }

        // Set photo
        $this->setVehiclePhoto($vehicle, $vehicleName, $rowNumber);

        // Set category
        $this->setVehicleCategory($vehicle, $row[self::COL_CATEGORY], $rowNumber);

        // Set pricing
        $this->setVehiclePricing($vehicle, $row, $rowNumber);

        return $vehicle;
    }

    /**
     * Find and set vehicle photo based on name matching
     * Photo is optional (column is nullable) - can be added later from dashboard
     */
    protected function setVehiclePhoto(Vehicle $vehicle, ?string $vehicleName, int $rowNumber): void
    {
        $vehicleName = $vehicleName ?? 'Unknown Vehicle';
        // Try exact match first
        $photo = VehiclesPhotos::query()
            ->where('name', 'like', '%' . trim(strtolower($vehicleName)) . '%')
            ->first();

        // If no exact match, try matching just the car model (first two words)
        if ($photo === null) {
            $nameParts = explode(' ', trim($vehicleName));
            if (count($nameParts) >= 2) {
                $shortName = $nameParts[0] . ' ' . $nameParts[1];
                $photo = VehiclesPhotos::query()
                    ->where('name', 'like', '%' . strtolower($shortName) . '%')
                    ->first();
            }
        }

        if ($photo === null) {
            // Photo is nullable - vehicle will be created without a photo.
            // The supplier can add a photo later from the dashboard.
            $vehicle->photo = null;
            info("Warning: No photo found for vehicle '{$vehicleName}' in row {$rowNumber}. Vehicle created without photo.");
        } else {
            $vehicle->photo = $photo->photo;
            info("Photo found for vehicle '{$vehicleName}': {$photo->photo}");
        }
    }

    /**
     * Find and set vehicle category
     * If category is empty or not found, set to null (optional)
     */
    protected function setVehicleCategory(Vehicle $vehicle, ?string $categoryName, int $rowNumber): void
    {
        if (empty($categoryName)) {
            info("Warning: Category is empty for row {$rowNumber}");
            $vehicle->category = null;
            return;
        }

        $category = Category::query()
            ->where('name', 'like', '%' . trim($categoryName) . '%')
            ->first();

        if ($category === null) {
            info("Warning: Category '{$categoryName}' not found for row {$rowNumber}");
        }

        $vehicle->category = $category?->id;
    }

    /**
     * Set vehicle pricing from row data
     * Only daily price is required, week and month prices are optional
     */
    protected function setVehiclePricing(Vehicle $vehicle, Collection|array $row, int $rowNumber): void
    {
        $dailyPrice = $this->parsePrice($row[self::COL_PRICE_1_3_DAYS] ?? null);
        $weekPrice = $this->parsePrice($row[self::COL_PRICE_WEEK] ?? null);
        $monthPrice = $this->parsePrice($row[self::COL_PRICE_MONTH] ?? null);

        // Validate daily price (required)
        if (!$this->isValidPrice($dailyPrice)) {
            $this->addError($rowNumber, "1-3 days Price is required and must be greater than 0");
        }
        $vehicle->price = $dailyPrice ?? 0;

        // Week price is optional but must be valid if provided
        if ($weekPrice !== null && $weekPrice < 0) {
            $this->addError($rowNumber, "Week Price cannot be negative");
        }
        $vehicle->week_price = $weekPrice;

        // Month price is optional
        if ($monthPrice !== null && $monthPrice < 0) {
            $this->addError($rowNumber, "Month Price cannot be negative");
        }
        $vehicle->month_price = $monthPrice;
    }

    /**
     * Parse price value - handles various formats
     */
    protected function parsePrice($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        // Remove currency symbols and whitespace
        $cleaned = preg_replace('/[^0-9.,]/', '', (string)$value);

        // Handle comma as decimal separator
        $cleaned = str_replace(',', '.', $cleaned);

        if ($cleaned === '' || !is_numeric($cleaned)) {
            return null;
        }

        return (float)$cleaned;
    }

    /**
     * Check if price is valid (not null, not empty, and greater than 0)
     */
    protected function isValidPrice($price): bool
    {
        return !empty($price) && $price > 0;
    }

    /**
     * Check if price is negative
     */
    protected function isNegativePrice($price): bool
    {
        return $price !== null && $price < 0;
    }

    /**
     * Determine if confirmation type is instant
     */
    protected function isInstantConfirmation(?string $confirmationType): int
    {
        return str_contains(strtolower($confirmationType ?? ''), 'instant') ? 1 : 0;
    }

    /**
     * Process and save vehicle specifications
     */
    protected function processVehicleSpecifications(Vehicle $vehicle, Collection|array $row): void
    {
        $this->addAirConditionSpec($vehicle, $row[self::COL_AIR_CONDITION]);
        $this->addDoorsSpec($vehicle, $row[self::COL_DOORS]);
        $this->addSuitcaseSpec($vehicle, $row[self::COL_SUITCASE]);
        $this->addSeatsSpec($vehicle, $row[self::COL_SEATS]);
        $this->addFuelSpec($vehicle, $row[self::COL_FUEL]);
        $this->addTransmissionSpec($vehicle, $row[self::COL_TRANSMISSION]);
    }

    /**
     * Add air condition specification
     */
    protected function addAirConditionSpec(Vehicle $vehicle, ?string $value): void
    {
        if (empty($value)) {
            return;
        }

        $acValue = $this->parseAirConditionValue($value);
        if ($acValue === null) {
            return;
        }

        $spec = $this->findSpecification('air');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, 'Air Conditioner', $acValue, $spec->icon);
        }
    }

    /**
     * Add doors specification
     */
    protected function addDoorsSpec(Vehicle $vehicle, $value): void
    {
        if (!is_numeric($value)) {
            return;
        }

        $spec = $this->findSpecification('door');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, 'Doors', $value, $spec->icon);
        }
    }

    /**
     * Add suitcase specification
     */
    protected function addSuitcaseSpec(Vehicle $vehicle, $value): void
    {
        if (empty($value)) {
            return;
        }

        $spec = $this->findSpecification('suitcase');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, 'Suitcase', $value, $spec->icon);
        }
    }

    /**
     * Add seats specification
     */
    protected function addSeatsSpec(Vehicle $vehicle, $value): void
    {
        if (!is_numeric($value)) {
            return;
        }

        $spec = $this->findSpecification('seats');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, 'Number Of Seats', $value, $spec->icon);
        }
    }

    /**
     * Add fuel type specification
     */
    protected function addFuelSpec(Vehicle $vehicle, ?string $value): void
    {
        if (empty($value)) {
            return;
        }

        // Normalize fuel value: Gas = Petrol
        $normalized = match (strtolower(trim($value))) {
            'gas', 'petrol', 'gasoline' => 'Gas',
            'diesel'                    => 'Diesel',
            'electric', 'ev'            => 'Electric',
            'hybrid'                    => 'Hybrid',
            'lpg'                       => 'LPG',
            default                     => ucfirst(strtolower(trim($value))),
        };

        $spec = $this->findSpecification('fuel');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, 'Fuel', $normalized, $spec->icon);
        }
    }

    /**
     * Add transmission specification
     */
    protected function addTransmissionSpec(Vehicle $vehicle, ?string $value): void
    {
        if (empty($value)) {
            return;
        }

        $normalized = match (strtolower(trim($value))) {
            'auto', 'automatic' => 'Automatic',
            'manual'           => 'Manual',
            'semi-automatic'   => 'Semi-Automatic',
            default            => ucfirst(strtolower(trim($value))),
        };

        $spec = $this->findSpecification('trans');
        if ($spec) {
            $this->createVehicleSpecification($vehicle->id, $spec->name, $normalized, $spec->icon);
        }
    }

    /**
     * Find a specification by name pattern
     */
    protected function findSpecification(string $namePattern): ?Specification
    {
        return Specification::query()
            ->where('name', 'like', '%' . $namePattern . '%')
            ->first();
    }

    /**
     * Create a vehicle specification record
     */
    protected function createVehicleSpecification(int $vehicleId, string $name, $value, ?string $icon): void
    {
        VehicleSpecification::query()->insert([
            'vehicle_id' => $vehicleId,
            'name' => $name,
            'value' => $value,
            'icon' => $icon,
        ]);
    }

    /**
     * Process and save location type for vehicle
     */
    protected function processLocationType(Vehicle $vehicle, Collection|array $row): void
    {
        $locationTypeName = $row[self::COL_LOCATION_TYPE] ?? null;
        if (empty($locationTypeName)) {
            return;
        }

        $locationType = LocationType::query()
            ->where('name', 'like', '%' . strtolower(trim($locationTypeName)) . '%')
            ->first();

        if ($locationType) {
            LocationTypeVehicle::query()->insert([
                'location_type_id' => $locationType->id,
                'vehicle_id' => $vehicle->id,
            ]);
        }
    }

    /**
     * Process and save fuel policy for vehicle
     */
    protected function processFuelPolicy(Vehicle $vehicle, Collection|array $row): void
    {
        $fuelPolicyName = $row[self::COL_FUEL_POLICY] ?? null;
        if (empty($fuelPolicyName)) {
            return;
        }

        $fuelPolicy = FuelPolicy::query()
            ->where('name', 'like', '%' . strtolower(trim($fuelPolicyName)) . '%')
            ->first();

        if ($fuelPolicy) {
            $vehicle->fuel_policy = $fuelPolicy->id;
            $vehicle->save();
        }
    }

    /**
     * Process the included items sheet
     */
    protected function processIncludedSheet(Collection $collection): void
    {
        if ($this->hasErrors()) {
            return;
        }

        foreach ($collection as $row) {
            $includedName = $row[0] ?? null;

            if (empty($includedName)) {
                break;
            }

            $included = $this->createIncluded($includedName);
            $this->linkIncludedToVehicles($included->id);
        }
    }

    /**
     * Create a new included item
     */
    protected function createIncluded(string $name): Included
    {
        $included = new Included();
        $included->what_is_included = $name;
        $included->save();

        return $included;
    }

    /**
     * Link an included item to all imported vehicles
     */
    protected function linkIncludedToVehicles(int $includedId): void
    {
        foreach ($this->vehicleIds as $vehicleId) {
            VehicleIncluded::query()->insert([
                'vehicle_id' => $vehicleId,
                'included_id' => $includedId,
            ]);
        }
    }

    /**
     * Parse air condition value from various input formats
     */
    protected function parseAirConditionValue(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $lowercaseValue = strtolower(trim($value));

        foreach (self::AC_KEYWORDS as $keyword) {
            if (str_contains($lowercaseValue, $keyword)) {
                return 'Air Conditioning';
            }
        }

        return null;
    }

    /**
     * Add an error to the errors array
     */
    protected function addError(int $rowNumber, string $message): void
    {
        $this->errors[] = [
            'row' => $rowNumber,
            'error' => "{$message} in row number {$rowNumber}",
        ];
    }

    /**
     * Check if there are any errors
     */
    protected function hasErrors(): bool
    {
        return !empty($this->errors);
    }

    /**
     * Magic getter for backward compatibility
     */
    public function __get(string $name)
    {
        return match ($name) {
            'errors' => $this->errors,
            'vehicleIds' => $this->vehicleIds,
            'branchId' => $this->branchId,
            'supplierId' => $this->supplierId,
            default => null,
        };
    }
}
