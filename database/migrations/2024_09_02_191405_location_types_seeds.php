<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \App\Models\LocationType::query()->insert([
            ['name' => 'Terminal'],
            ['name' => 'Airport'],
            ['name' => 'Meet &Greet'],
            ['name' => 'Delivery TO Location'],
            ['name' => 'Shuttle Airport']
        ]);
        Schema::create('location_type_vehicle', function (Blueprint $table) {
           $table->id();
           $table->unsignedBigInteger('vehicle_id');
           $table->unsignedBigInteger('location_type_id');
           $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
