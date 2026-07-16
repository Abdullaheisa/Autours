<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Fix Istanbul airport branches that have the same name but
     * are actually different airports (IST vs SAW).
     *
     * company_id=96 (essence car rental) has:
     * - station_id 'TR-IST-IST' → Istanbul Airport (IST)
     * - station_id 'TR-IST-SAW' → Sabiha Gökçen Airport (SAW)
     */
    public function up(): void
    {
        DB::table('branches')
            ->where('station_id', 'TR-IST-IST')
            ->where('company_id', 96)
            ->update([
                'name' => 'Istanbul Airport (IST)',
                'abriviation' => 'IST',
                'location_type' => 'Airport',
            ]);

        DB::table('branches')
            ->where('station_id', 'TR-IST-SAW')
            ->where('company_id', 96)
            ->update([
                'name' => 'Sabiha Gökçen Airport (SAW)',
                'abriviation' => 'SAW',
                'location_type' => 'Airport',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('branches')
            ->where('station_id', 'TR-IST-IST')
            ->where('company_id', 96)
            ->update(['name' => 'Istanbul airport']);

        DB::table('branches')
            ->where('station_id', 'TR-IST-SAW')
            ->where('company_id', 96)
            ->update(['name' => 'Istanbul airport']);
    }
};
