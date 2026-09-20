<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $hLeadVehicles = Vehicle::where('supplier', 162)->get(['id', 'category', 'name']);

        if ($hLeadVehicles->isEmpty()) {
            return;
        }

        $now = now();
        $recordsToInsert = [];

        foreach ($hLeadVehicles as $vehicle) {
            $catId = (int) $vehicle->category;

            // Fetch current specifications for this vehicle
            $specs = VehicleSpecification::where('vehicle_id', $vehicle->id)->get()->keyBy('name');

            $luggageSpec = $specs->get('Number of Luggages');
            $currentBags = $luggageSpec ? (int) $luggageSpec->value : 0;

            // Determine suitcase size and non-zero luggage count
            if ($currentBags <= 0) {
                if ($catId === 12 || $catId === 5) {
                    $suitValue = 'Small';
                    $bagCount = '1';
                } elseif ($catId === 3) {
                    $suitValue = 'Medium';
                    $bagCount = '2';
                } elseif (in_array($catId, [4, 6, 7, 8, 9, 10])) {
                    $suitValue = 'Large';
                    $bagCount = '3';
                } else {
                    $suitValue = 'Medium';
                    $bagCount = '2';
                }

                // Update Number of Luggages from 0 to realistic count
                if ($luggageSpec) {
                    $luggageSpec->update(['value' => $bagCount]);
                }
            } else {
                $bagCount = (string) $currentBags;
                if ($currentBags <= 1) {
                    $suitValue = 'Small';
                } elseif ($currentBags <= 3) {
                    $suitValue = 'Medium';
                } else {
                    $suitValue = 'Large';
                }
            }

            // Upsert standard "Suitcase" spec
            $suitcaseSpec = $specs->get('Suitcase');
            if ($suitcaseSpec) {
                $suitcaseSpec->update([
                    'value' => $suitValue,
                    'icon' => 'Luggage'
                ]);
            } else {
                $recordsToInsert[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Suitcase',
                    'value' => $suitValue,
                    'icon' => 'Luggage',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Standardize Doors
            if (!$specs->has('Doors') && $specs->has('Number of Doors')) {
                $recordsToInsert[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Doors',
                    'value' => $specs->get('Number of Doors')->value,
                    'icon' => 'DoorOpen',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Standardize Number of seats
            if (!$specs->has('Number of seats') && $specs->has('Number of Adults')) {
                $recordsToInsert[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Number of seats',
                    'value' => $specs->get('Number of Adults')->value,
                    'icon' => 'Armchair',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            // Standardize Fuel
            if (!$specs->has('Fuel') && $specs->has('Fuel Type')) {
                $recordsToInsert[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Fuel',
                    'value' => $specs->get('Fuel Type')->value,
                    'icon' => 'Fuel',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if (!empty($recordsToInsert)) {
            foreach (array_chunk($recordsToInsert, 500) as $chunk) {
                VehicleSpecification::insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hLeadIds = Vehicle::where('supplier', 162)->pluck('id');
        VehicleSpecification::whereIn('vehicle_id', $hLeadIds)
            ->whereIn('name', ['Suitcase', 'Doors', 'Number of seats', 'Fuel'])
            ->delete();
    }
};
