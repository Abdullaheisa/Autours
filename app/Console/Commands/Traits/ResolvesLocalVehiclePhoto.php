<?php

namespace App\Console\Commands\Traits;

use App\Models\VehiclesPhotos;

trait ResolvesLocalVehiclePhoto
{
    /**
     * Find and return local vehicle photo based on name matching
     */
    protected function resolveLocalPhoto(?string $vehicleName): ?string
    {
        if (empty($vehicleName)) {
            return null;
        }

        $vehicleName = trim($vehicleName);
        $lowerName = mb_strtolower($vehicleName);

        // Try exact match first (case-insensitive)
        $photo = VehiclesPhotos::query()
            ->whereRaw('LOWER(name) like ?', ['%' . $lowerName . '%'])
            ->first();

        // If no exact match, try matching just the car model (first two words, case-insensitive)
        if ($photo === null) {
            $nameParts = explode(' ', $vehicleName);
            if (count($nameParts) >= 2) {
                $shortName = mb_strtolower($nameParts[0] . ' ' . $nameParts[1]);
                $photo = VehiclesPhotos::query()
                    ->whereRaw('LOWER(name) like ?', ['%' . $shortName . '%'])
                    ->first();
            }
        }

        // If still no match, check if the database name substring matches inside the vehicle name (reverse check)
        if ($photo === null) {
            $photo = VehiclesPhotos::query()
                ->whereRaw('? LIKE CONCAT(\'%\', LOWER(name), \'%\')', [$lowerName])
                ->whereRaw('LENGTH(name) >= 4') // prevent very short generic names from false matching
                ->first();
        }


        return $photo ? $photo->photo : null;
    }
}
