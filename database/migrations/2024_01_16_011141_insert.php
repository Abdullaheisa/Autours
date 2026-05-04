<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::table('specifications', function (Blueprint $table){
            $table->string('icon');
        });
        \App\Models\Specification::query()->insert([
            [
                'id' => 1,
                'name' => 'Number of seats',
                'options' => json_encode(['4','5','7']),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'chair',
            ],
            [
                'id' => 5,
                'name' => 'Suitcase',
                'options' => json_encode(["large", "Medium", "Small"]),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'suitcase',
            ],
            [
                'id' => 7,
                'name' => 'Air Conditioner',
                'options' => json_encode(["cool & Heat"]),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'air-freshener',
            ],
            [
                'id' => 8,
                'name' => 'Transmission',
                'options' => json_encode(["Automatic Transmission", "Manual Transmission"]),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'gear',
            ],
            [
                'id' => 6,
                'name' => 'Fuel',
                'options' => json_encode(["Petrol","Gas","Electric","Hybrid Petrol & Gas","Hybrid Gas & Petrol"]),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'angle-double-up',
            ],
            [
                'id' => 11,
                'name' => 'Doors',
                'options' => json_encode(["1", "2", "3", "4", "5", "6"]),
                'created_at' => now(),
                'updated_at' => now(),
                'icon' => 'door-closed',
            ],

        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
