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
     * Export multiple sheets: Vehicles, Included, and Reference Data
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
                'Row #',                   // A (0)
                'Vehicle Name',            // B (1)
                'Category',                // C (2)
                'Air Condition',           // D (3)
                'Doors',                   // E (4)
                'Suitcase',                // F (5)
                'Seats',                   // G (6)
                'Fuel Type',               // H (7)
                'Transmission',            // I (8)
                'Location Type',           // J (9)
                'Fuel Policy',             // K (10)
                'Reserved',                // L (11)
                'Confirmation',            // M (12)
                'Pricing Mode',            // N (13) - standard | granular | dynamic
                'Price (1-2 Days)',        // O (14) - Daily Base Price
                'Price (3-4 Days)',        // P (15) - Granular / Custom
                'Price (5-7 Days)',        // Q (16) - Week Price
                'Price (8-14 Days)',       // R (17) - Granular / Custom
                'Price (15-30 Days)',      // S (18) - Month Price
                'Custom Price Ranges JSON',// T (19) - JSON string for custom tiers
                'Description',             // U (20)
            ],
            // Sample Row 1: Standard Pricing
            [
                1,
                'Toyota Corolla 2024',
                'Economy',
                'Air Conditioning',
                4,
                'Medium',
                5,
                'Gas',
                'Automatic',
                'Airport',
                'Full to Full',
                '',
                'Instant Confirmation',
                'standard',
                50.00,                     // Price 1-2 Days
                '',
                45.00,                     // Week Price (5-7 Days)
                '',
                40.00,                     // Month Price (15-30 Days)
                '',
                'A reliable and fuel-efficient sedan, perfect for city driving and airport transfers.',
            ],
            // Sample Row 2: Granular 5-Tier Pricing
            [
                2,
                'Honda Civic 2024',
                'Compact',
                'Air Conditioning',
                4,
                'Large',
                5,
                'Gas',
                'Manual',
                'City',
                'Same to Same',
                '',
                'On Request',
                'granular',
                60.00,                     // 1-2 Days
                55.00,                     // 3-4 Days
                50.00,                     // 5-7 Days
                45.00,                     // 8-14 Days
                40.00,                     // 15-30 Days
                '',
                'A stylish compact car offering excellent performance and comfort for urban trips.',
            ],
            // Sample Row 3: Custom Dynamic Pricing Ranges
            [
                3,
                'Mercedes-Benz C-Class',
                'Luxury',
                'Air Conditioning',
                4,
                'Medium',
                5,
                'Gas',
                'Automatic',
                'Airport',
                'Full to Full',
                '',
                'Instant Confirmation',
                'dynamic',
                '',
                '',
                '',
                '',
                '',
                '[{"minDays":1,"maxDays":3,"price":120},{"minDays":4,"maxDays":10,"price":100},{"minDays":11,"maxDays":30,"price":85}]',
                'Premium executive sedan with custom flexible pricing tiers.',
            ],
            // Empty template row for supplier input
            [
                4,
                '',  // Vehicle Name (required)
                '',  // Category
                '',  // Air Condition
                '',  // Doors
                '',  // Suitcase
                '',  // Seats
                '',  // Fuel Type
                '',  // Transmission
                '',  // Location Type
                '',  // Fuel Policy
                '',
                '',  // Confirmation
                'standard', // Pricing Mode: standard | granular | dynamic
                '',  // Price 1-2 Days (required)
                '',  // Price 3-4 Days
                '',  // Price 5-7 Days / Week Price
                '',  // Price 8-14 Days
                '',  // Price 15-30 Days / Month Price
                '',  // Custom Price Ranges JSON (optional)
                '',  // Description (optional)
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
            'D' => 18,  // Air Condition
            'E' => 8,   // Doors
            'F' => 10,  // Suitcase
            'G' => 8,   // Seats
            'H' => 12,  // Fuel Type
            'I' => 15,  // Transmission
            'J' => 15,  // Location Type
            'K' => 15,  // Fuel Policy
            'L' => 10,  // Reserved
            'M' => 22,  // Confirmation
            'N' => 15,  // Pricing Mode
            'O' => 18,  // Price (1-2 Days)
            'P' => 18,  // Price (3-4 Days)
            'Q' => 18,  // Price (5-7 Days)
            'R' => 18,  // Price (8-14 Days)
            'S' => 18,  // Price (15-30 Days)
            'T' => 35,  // Custom Price Ranges JSON
            'U' => 45,  // Description
        ];
    }

    /**
     * Apply styles to the worksheet
     */
    public function styles(Worksheet $sheet): array
    {
        // Set header row style
        $sheet->getStyle('A1:U1')->applyFromArray([
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

        // Highlight sample rows
        $sheet->getStyle('A2:U5')->applyFromArray([
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
        $sheet->getStyle('A2:U4')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DEEAF6'],
            ],
        ]);

        // Highlight Description column header
        $sheet->getStyle('U1')->applyFromArray([
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '7030A0'],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getStyle('U2:U100')->getAlignment()->setWrapText(true);

        return [];
    }
}

/**
 * Included Items Sheet
 */
class IncludedSheet implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    public function title(): string
    {
        return 'Included Items';
    }

    public function array(): array
    {
        return [
            ['What is Included'],
            ['Unlimited Mileage'],
            ['Third Party Liability Insurance'],
            ['Collision Damage Waiver (CDW)'],
            ['Theft Protection'],
            ['Road Assistance 24/7'],
            ['Airport Fees'],
            ['VAT'],
            [''],
            [''],
            [''],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
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
    public function title(): string
    {
        return 'Reference Data';
    }

    public function array(): array
    {
        $categories = Category::query()->pluck('name')->toArray();
        $fuelPolicies = FuelPolicy::query()->pluck('name')->toArray();
        $locationTypes = LocationType::query()->pluck('name')->toArray();

        $data = [
            ['Categories', 'Fuel Policies', 'Location Types', 'Confirmation Types', 'Air Condition Values', 'Transmission Types', 'Fuel Types', 'Suitcase Options', 'Pricing Modes'],
        ];

        $maxRows = max(
            count($categories),
            count($fuelPolicies),
            count($locationTypes),
            5
        );

        $confirmationTypes = ['Instant Confirmation', 'On Request'];
        $acValues = ['A/C', 'Air Conditioning', 'AC'];
        $transmissionTypes = ['Automatic', 'Manual', 'Semi-Automatic'];
        $fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
        $suitcaseOptions = ['Small', 'Medium', 'Large'];
        $pricingModes = ['standard', 'granular', 'dynamic'];

        for ($i = 0; $i < $maxRows; $i++) {
            $data[] = [
                $categories[$i] ?? '',
                $fuelPolicies[$i] ?? '',
                $locationTypes[$i] ?? '',
                $confirmationTypes[$i] ?? '',
                $acValues[$i] ?? '',
                $transmissionTypes[$i] ?? '',
                $fuelTypes[$i] ?? '',
                $suitcaseOptions[$i] ?? '',
                $pricingModes[$i] ?? '',
            ];
        }

        return $data;
    }

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
            'H' => 15,
            'I' => 15,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
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
