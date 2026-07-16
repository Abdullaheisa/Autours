<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Normalize location_type values in branches table.
     *
     * Fixes: numeric values ('1', '2'), empty strings, NULLs,
     * inconsistent casing, and redundant labels.
     */
    public function up(): void
    {
        // Map numeric '1' → 'Airport' (based on existing data patterns)
        DB::table('branches')
            ->where('location_type', '1')
            ->update(['location_type' => 'Airport']);

        // Map numeric '2' → 'Downtown' (based on existing data patterns)
        DB::table('branches')
            ->where('location_type', '2')
            ->update(['location_type' => 'Downtown']);

        // 'City' is redundant with 'Downtown'
        DB::table('branches')
            ->where('location_type', 'City')
            ->update(['location_type' => 'Downtown']);

        // Normalize casing: 'BusTerminal' → 'Bus Terminal'
        DB::table('branches')
            ->where('location_type', 'BusTerminal')
            ->update(['location_type' => 'Bus Terminal']);

        // Normalize casing: 'Railway station' → 'Railway Station'
        DB::table('branches')
            ->where('location_type', 'Railway station')
            ->update(['location_type' => 'Railway Station']);

        // Normalize casing: 'Bus station' → 'Bus Station'
        DB::table('branches')
            ->where('location_type', 'Bus station')
            ->update(['location_type' => 'Bus Station']);

        // Default NULL/empty to 'Downtown'
        DB::table('branches')
            ->whereNull('location_type')
            ->orWhere('location_type', '')
            ->update(['location_type' => 'Downtown']);
    }

    /**
     * Reverse the migrations — no practical rollback for data normalization.
     */
    public function down(): void
    {
        // Data normalization cannot be reliably reversed.
    }
};
