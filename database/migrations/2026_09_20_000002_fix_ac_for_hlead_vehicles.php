<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $supplier = User::where('email', 'emissias@h-lead.gr')
            ->orWhere('company', 'like', '%H-Lead%')
            ->first();

        if (!$supplier) {
            return;
        }

        $vehicleIds = Vehicle::where('supplier', $supplier->id)->pluck('id')->toArray();
        if (empty($vehicleIds)) {
            return;
        }

        // Update all existing Air Conditioner specs for H-Lead vehicles from 'Yes' to 'Air Conditioning'
        VehicleSpecification::whereIn('vehicle_id', $vehicleIds)
            ->where('name', 'Air Conditioner')
            ->update([
                'value' => 'Air Conditioning',
                'icon' => 'Wind',
                'updated_at' => now(),
            ]);

        // If any H-Lead vehicle was missing the Air Conditioner specification, insert it
        $vehiclesWithAc = VehicleSpecification::whereIn('vehicle_id', $vehicleIds)
            ->where('name', 'Air Conditioner')
            ->pluck('vehicle_id')
            ->toArray();

        $missingIds = array_diff($vehicleIds, $vehiclesWithAc);
        if (!empty($missingIds)) {
            $now = now();
            $records = [];
            foreach ($missingIds as $vId) {
                $records[] = [
                    'vehicle_id' => $vId,
                    'name' => 'Air Conditioner',
                    'value' => 'Air Conditioning',
                    'icon' => 'Wind',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
            foreach (array_chunk($records, 500) as $chunk) {
                VehicleSpecification::insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $supplier = User::where('email', 'emissias@h-lead.gr')
            ->orWhere('company', 'like', '%H-Lead%')
            ->first();

        if (!$supplier) {
            return;
        }

        $vehicleIds = Vehicle::where('supplier', $supplier->id)->pluck('id')->toArray();
        if (empty($vehicleIds)) {
            return;
        }

        VehicleSpecification::whereIn('vehicle_id', $vehicleIds)
            ->where('name', 'Air Conditioner')
            ->update([
                'value' => 'Yes',
                'icon' => 'las la-snowflake',
                'updated_at' => now(),
            ]);
    }
};
