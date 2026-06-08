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
        Schema::create('vehicle_station_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->decimal('day_price', 12, 2)->default(0);
            $table->decimal('week_price', 12, 2)->default(0);
            $table->decimal('month_price', 12, 2)->default(0);
            $table->string('currency', 10)->nullable();
            $table->dateTime('price_date_from')->nullable();
            $table->dateTime('price_date_to')->nullable();
            $table->timestamps();

            $table->unique(['vehicle_id', 'branch_id']);
        });
    }

    /**
     * Reverse the migration.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_station_prices');
    }
};
