<?php

namespace App\Exports;

use App\Models\Category;
use App\Models\FuelPolicy;
use App\Models\LocationType;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class VehiclesTemplateExport implements WithMultipleSheets
{
    /**
     * Export multiple sheets: Vehicles and Included
     */
    public function sheets(): array
    {
        return [
            new VehiclesSheet(),
            new IncludedSheet(),
            new ReferenceDataSheet(),
        ];
    }
}

/**
 * Vehicles Sheet with headers and sample data
 */
class VehiclesSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    /**
     * Sheet title
     */
    public function title(): string
    {
        return 'Vehicles';
    }

    /**
     * Column headers and sample data
     */
    public function array(): array
    {
        return [
            // Header row
            [
                'Row #',           // A - COL_ROW_NUMBER (0)
                'Vehicle Name',    // B - COL_VEHICLE_NAME (1)
                'Category',        // C - COL_CATEGORY (2)
                'Air Condition',   // D - COL_AIR_CONDITION (3)
                'Doors',           // E - COL_DOORS (4)
                'Suitcase',        // F - COL_SUITCASE (5)
                'Seats',           // G - COL_SEATS (6)
                'Fuel Type',       // H - COL_FUEL (7)
                'Transmission',    // I - COL_TRANSMISSION (8)
                'Location Type',   // J - COL_LOCATION_TYPE (9)
                'Fuel Policy',     // K - COL_FUEL_POLICY (10)
                'Reserved',        // L - COL_RESERVED_11 (11)
                'Confirmation',    // M - COL_CONFIRMATION_TYPE (12)
                'Reserved',        // N - COL_RESERVED_13 (13)
                'Reserved',        // O - COL_RESERVED_14 (14)
                'Price (1-3 Days)',// P - COL_PRICE_1_3_DAYS (15)
                'Week Price',      // Q - COL_PRICE_WEEK (16)
                'Month Price',     // R - COL_PRICE_MONTH (17)
            ],
            // Sample data row 1
            [
                1,
                'Toyota Corolla 2024',
                'Economy',
                'A/C',
                4,
                2,
                5,
                'Petrol',
                'Automatic',
                'Airport',
                'Full to Full',
                '',
                'Instant Confirmation',
                '',
                '',
                50.00,
                45.00,
                40.00,
            ],
            // Sample data row 2
            [
                2,
                'Honda Civic 2024',
                'Compact',
                'Air Conditioning',
                4,
                3,
                5,
                'Petrol',
                'Manual',
                'City',
                'Same to Same',
                '',
                'On Request',
                '',
                '',
                55.00,
                48.00,
                42.00,
            ],
            // Sample data row 3 (empty template)
            [
                3,
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
            ],
        ];
    }

    /**
     * Column widths for better readability
     */
    public function columnWidths(): array
    {
        return [
            'A' => 8,   // Row #
            'B' => 25,  // Vehicle Name
            'C' => 15,  // Category
            'D' => 15,  // Air Condition
            'E' => 8,   // Doors
            'F' => 10,  // Suitcase
            'G' => 8,   // Seats
            'H' => 12,  // Fuel Type
            'I' => 15,  // Transmission
            'J' => 15,  // Location Type
            'K' => 15,  // Fuel Policy
            'L' => 10,  // Reserved
            'M' => 20,  // Confirmation
            'N' => 10,  // Reserved
            'O' => 10,  // Reserved
            'P' => 18,  // Price (1-3 Days)
            'Q' => 12,  // Week Price
            'R' => 12,  // Month Price
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet): array
    {
        // Set header row style
        $sheet->getStyle('A1:R1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Set sample data row styles
        $sheet->getStyle('A2:R4')->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Highlight sample rows with light blue
        $sheet->getStyle('A2:R3')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DEEAF6'],
            ],
        ]);

        // Set row height
        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}

/**
 * Included Items Sheet
 */
class IncludedSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    /**
     * Sheet title
     */
    public function title(): string
    {
        return 'Included Items';
    }

    /**
     * Column headers and sample data
     */
    public function array(): array
    {
        return [
            // Header row
            ['What is Included'],
            // Sample items
            ['Unlimited Mileage'],
            ['Third Party Liability Insurance'],
            ['Collision Damage Waiver (CDW)'],
            ['Theft Protection'],
            ['Road Assistance 24/7'],
            ['Airport Fees'],
            ['VAT'],
            // Empty rows for more entries
            [''],
            [''],
            [''],
        ];
    }

    /**
     * Column widths
     */
    public function columnWidths(): array
    {
        return [
            'A' => 40,
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet): array
    {
        // Header style
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '70AD47'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        // Sample data style
        $sheet->getStyle('A2:A8')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E2EFDA'],
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}

/**
 * Reference Data Sheet - Contains valid values for dropdowns
 */
class ReferenceDataSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    /**
     * Sheet title
     */
    public function title(): string
    {
        return 'Reference Data';
    }

    /**
     * Reference data for valid values
     */
    public function array(): array
    {
        $categories = Category::query()->pluck('name')->toArray();
        $fuelPolicies = FuelPolicy::query()->pluck('name')->toArray();
        $locationTypes = LocationType::query()->pluck('name')->toArray();

        // Build the reference data array
        $data = [
            // Header row
            ['Categories', 'Fuel Policies', 'Location Types', 'Confirmation Types', 'Air Condition Values', 'Transmission Types', 'Fuel Types'],
        ];

        // Find the max rows needed
        $maxRows = max(
            count($categories),
            count($fuelPolicies),
            count($locationTypes),
            4 // For static options
        );

        $confirmationTypes = ['Instant Confirmation', 'On Request'];
        $acValues = ['A/C', 'Air Conditioning', 'AC'];
        $transmissionTypes = ['Automatic', 'Manual', 'Semi-Automatic'];
        $fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];

        for ($i = 0; $i < $maxRows; $i++) {
            $data[] = [
                $categories[$i] ?? '',
                $fuelPolicies[$i] ?? '',
                $locationTypes[$i] ?? '',
                $confirmationTypes[$i] ?? '',
                $acValues[$i] ?? '',
                $transmissionTypes[$i] ?? '',
                $fuelTypes[$i] ?? '',
            ];
        }

        return $data;
    }

    /**
     * Column widths
     */
    public function columnWidths(): array
    {
        return [
            'A' => 20,
            'B' => 20,
            'C' => 20,
            'D' => 25,
            'E' => 20,
            'F' => 20,
            'G' => 15,
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet): array
    {
        // Header style
        $sheet->getStyle('A1:G1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'ED7D31'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                ],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}

