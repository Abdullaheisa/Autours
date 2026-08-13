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
        Schema::table('vehicles', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->change();
            $table->decimal('week_price', 12, 2)->change();
            $table->decimal('month_price', 12, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->decimal('price', 8, 2)->change();
            $table->decimal('week_price', 8, 2)->change();
            $table->decimal('month_price', 8, 2)->change();
        });
    }
};
