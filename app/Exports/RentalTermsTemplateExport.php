<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class RentalTermsTemplateExport implements FromArray, WithTitle, WithStyles, WithColumnWidths
{
    public function title(): string
    {
        return 'Rental Terms Template';
    }

    public function array(): array
    {
        return [
            // Header Row
            [
                'Title',
                'Description'
            ],
            // Sample Row 1
            [
                'Minimum Age Requirement',
                'Renter must be at least 21 years old. Drivers under 25 years old may be subject to a young driver surcharge.'
            ],
            // Sample Row 2
            [
                'Security Deposit',
                'A valid credit card in the main driver\'s name is required for a security deposit of USD 500.00 upon vehicle pickup.'
            ],
            // Sample Row 3
            [
                'Fuel Policy',
                'Same-to-Same: The vehicle must be returned with the same amount of fuel as provided at the start of the rental.'
            ],
            // Sample Row 4
            [
                'Required Documents',
                'Original passport, valid national driving license held for at least 1 year, and international driving permit (if applicable).'
            ]
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 30, // Title column
            'B' => 70, // Description column
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Style the header row (Row 1)
        $sheet->getStyle('A1:B1')->applyFromArray([
            'font' => [
                'name' => 'Segoe UI',
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'], // Dark Slate Navy color
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'wrapText' => true,
            ],
        ]);

        // Style the data rows (Row 2 to 5)
        $sheet->getStyle('A2:B5')->applyFromArray([
            'font' => [
                'name' => 'Segoe UI',
                'size' => 10.5,
                'color' => ['rgb' => '334155'],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_TOP,
                'wrapText' => true,
            ],
        ]);

        // Add subtle borders to all cells
        $styleArray = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'],
                ],
            ],
        ];
        $sheet->getStyle('A1:B5')->applyFromArray($styleArray);

        // Adjust row heights for spacious clean look
        $sheet->getRowDimension(1)->setRowHeight(32);
        for ($row = 2; $row <= 5; $row++) {
            $sheet->getRowDimension($row)->setRowHeight(40);
        }

        return [];
    }
}
