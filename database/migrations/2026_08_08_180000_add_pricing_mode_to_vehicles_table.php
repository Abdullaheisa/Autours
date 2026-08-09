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
            if (!Schema::hasColumn('vehicles', 'pricing_mode')) {
                $table->string('pricing_mode')->default('standard')->nullable()->after('month_price');
            }
            if (!Schema::hasColumn('vehicles', 'granular_prices')) {
                $table->json('granular_prices')->nullable()->after('pricing_mode');
            }
            if (!Schema::hasColumn('vehicles', 'custom_price_tiers')) {
                $table->json('custom_price_tiers')->nullable()->after('granular_prices');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            if (Schema::hasColumn('vehicles', 'pricing_mode')) {
                $table->dropColumn('pricing_mode');
            }
            if (Schema::hasColumn('vehicles', 'granular_prices')) {
                $table->dropColumn('granular_prices');
            }
            if (Schema::hasColumn('vehicles', 'custom_price_tiers')) {
                $table->dropColumn('custom_price_tiers');
            }
        });
    }
};
