<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Collection;

class RentalTermsImport implements ToCollection
{
    public $items = [];

    public function collection(Collection $rows)
    {
        $first = true;
        foreach ($rows as $row) {
            // Skip the header row
            if ($first) {
                $first = false;
                continue;
            }

            // Columns check
            $title = isset($row[0]) ? trim((string)$row[0]) : null;
            $description = isset($row[1]) ? trim((string)$row[1]) : $title;

            if (!empty($title)) {
                // Ensure proper UTF-8 encoding
                $cleanTitle = mb_convert_encoding($title, 'UTF-8', 'UTF-8');
                $cleanDesc = mb_convert_encoding($description, 'UTF-8', 'UTF-8');

                // Skip header or template placeholder rows
                if ($this->isPlaceholderRow($cleanTitle, $cleanDesc)) {
                    continue;
                }

                $this->items[] = [
                    'title' => $cleanTitle,
                    'description' => $cleanDesc
                ];
            }
        }
    }

    /**
     * Check if a row is a placeholder or header row that should not be imported as a term.
     */
    private function isPlaceholderRow(string $title, string $desc): bool
    {
        $normalizedTitle = mb_strtolower(trim($title));
        $normalizedDesc = mb_strtolower(trim($desc));

        // Skip exact placeholder titles
        $placeholderTitles = [
            'title',
            'title (العنوان)',
            'عنوان',
            'العنوان',
            'term title',
            'sample title',
            'term_title',
        ];

        if (in_array($normalizedTitle, $placeholderTitles, true)) {
            return true;
        }

        // Check if title contains Arabic/English placeholder keywords
        if (
            str_contains($normalizedTitle, 'العنوان') ||
            str_contains($normalizedTitle, 'عنوان') ||
            str_contains($normalizedDesc, 'الوصف والتفاصيل') ||
            str_contains($normalizedDesc, 'الوصف')
        ) {
            return true;
        }

        // Generic template header check (e.g. Title / Description)
        if (
            (str_starts_with($normalizedTitle, 'title') || $normalizedTitle === 'name') &&
            (str_starts_with($normalizedDesc, 'description') || $normalizedDesc === 'desc')
        ) {
            return true;
        }

        return false;
    }
}
