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

        $vehicles = Vehicle::where('supplier', $supplier->id)->get();
        if ($vehicles->isEmpty()) {
            return;
        }

        $vehicleIds = $vehicles->pluck('id')->toArray();

        // Preload specifications in bulk
        $transmissionSpecs = VehicleSpecification::where('name', 'Transmission')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('value', 'vehicle_id')
            ->toArray();

        $autoSpecs = VehicleSpecification::where('name', 'Automatic')
            ->where('value', 'Yes')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('vehicle_id', 'vehicle_id')
            ->toArray();

        $manualSpecs = VehicleSpecification::where('name', 'Manual')
            ->where('value', 'Yes')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('vehicle_id', 'vehicle_id')
            ->toArray();

        $specsToInsert = [];
        $now = now();

        foreach ($vehicles as $vehicle) {
            $name = $vehicle->name;

            // Determine transmission from specs
            $transmission = null;
            if (isset($transmissionSpecs[$vehicle->id])) {
                $val = strtolower(trim($transmissionSpecs[$vehicle->id]));
                if (str_contains($val, 'auto')) {
                    $transmission = 'Automatic';
                } elseif (str_contains($val, 'manual')) {
                    $transmission = 'Manual';
                }
            }

            if (!$transmission) {
                if (isset($autoSpecs[$vehicle->id])) {
                    $transmission = 'Automatic';
                } elseif (isset($manualSpecs[$vehicle->id])) {
                    $transmission = 'Manual';
                }
            }

            // Fallback: check vehicle description or name
            if (!$transmission) {
                if (preg_match('/\b(auto|automatic|aut)\b/i', $name . ' ' . $vehicle->description)) {
                    $transmission = 'Automatic';
                } else {
                    $transmission = 'Manual';
                }
            }

            // Queue Transmission specification if not already present
            if (!isset($transmissionSpecs[$vehicle->id])) {
                $specsToInsert[] = [
                    'vehicle_id' => $vehicle->id,
                    'name' => 'Transmission',
                    'value' => $transmission,
                    'icon' => 'las la-cogs',
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $transmissionSpecs[$vehicle->id] = $transmission;
            }

            // Skip name update if name already has Automatic or Manual
            if (preg_match('/\b(Automatic|Manual)\b/i', $name)) {
                continue;
            }

            $newName = $name . ' ' . $transmission;
            Vehicle::where('id', $vehicle->id)->update(['name' => $newName]);
        }

        if (!empty($specsToInsert)) {
            // Bulk insert in chunks of 500
            foreach (array_chunk($specsToInsert, 500) as $chunk) {
                VehicleSpecification::insert($chunk);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Name normalization is idempotent; no reverse needed
    }
};
