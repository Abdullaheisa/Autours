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

                $this->items[] = [
                    'title' => $cleanTitle,
                    'description' => $cleanDesc
                ];
            }
        }
    }
}
