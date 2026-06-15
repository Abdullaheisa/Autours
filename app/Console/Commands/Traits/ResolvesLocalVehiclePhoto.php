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

        // Try exact match first
        $photo = VehiclesPhotos::query()
            ->where('name', 'like', '%' . $vehicleName . '%')
            ->first();

        // If no exact match, try matching just the car model (first two words)
        if ($photo === null) {
            $nameParts = explode(' ', $vehicleName);
            if (count($nameParts) >= 2) {
                $shortName = $nameParts[0] . ' ' . $nameParts[1];
                $photo = VehiclesPhotos::query()
                    ->where('name', 'like', '%' . $shortName . '%')
                    ->first();
            }
        }


        return $photo ? $photo->photo : null;
    }
}
