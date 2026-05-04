<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \App\Models\FuelPolicy::query()->insert([
            [
                'name' => 'Full to Full',
                'description' => 'Receive the car with a full tank Return the car with a full tank.',
            ],[
                'name' => 'Pay for a full',
                'description' => 'Pay for a full tank of fuel in advance No need to refill the tank before returning the car.',
            ],[
                'name' => 'Same to Same',
                'description' => 'Return the car with the same fuel level as when picked up Pay only for the fuel used.',
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
