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
        Schema::create('fleet_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('category_name');
            $table->string('badge')->nullable();
            $table->string('car_name');
            $table->string('photo')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 10)->default('AED');
            $table->string('supplier_name')->nullable();
            $table->string('seats')->nullable();
            $table->string('doors')->nullable();
            $table->string('luggage')->nullable();
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fleet_vehicles');
    }
};
