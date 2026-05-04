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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->text('photo');
            $table->string('name');
            $table->integer('supplier');
            $table->decimal('price', 8, 2);
            $table->decimal('week_price', 8, 2)->nullable();
            $table->decimal('month_price', 8, 2)->nullable();
            $table->decimal('year_price', 8, 2)->nullable();
            $table->integer('pickup_loc');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('category')->nullable();
            $table->json('specifications')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
