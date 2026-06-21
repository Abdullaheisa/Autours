<?php

declare(strict_types=1);

namespace App\Console\Commands\Traits;

trait NormalizesVehicleNames
{
    /**
     * Normalize common keywords in vehicle names to make them look better.
     * For example, replace "AUT" or "AUTOMATiC" with "Automatic".
     */
    protected function normalizeVehicleName(string $name): string
    {
        if (empty($name)) {
            return $name;
        }

        // Normalize transmission types often appended to car names
        // Matches whole words like AUT, AUTO, AUTOMATIC, AUTOMATiC (case-insensitive)
        $name = preg_replace('/\b(?:AUT|AUTO|AUTOMATIC)\b/i', 'Automatic', $name);
        
        // Matches whole words like MAN, MANUAL (case-insensitive)
        $name = preg_replace('/\b(?:MAN|MANUAL)\b/i', 'Manual', $name);

        // Remove extra spaces that might have been left over or duplicated
        $name = trim(preg_replace('/\s+/', ' ', $name));

        return $name;
    }
}
