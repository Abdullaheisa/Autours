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
        \App\Models\RentalStatus::query()->insert([
            ['name_en' => 'Issued'],
            ['name_en' => 'Confirmed'],
            ['name_en' => 'Canceled'],
            ['name_en' => 'Pending',
            ]
        ]);
        Schema::table('rentals', function (Blueprint $table) {
//            $table->foreign('order_status')->on('rental_statuses')->references('id');
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
