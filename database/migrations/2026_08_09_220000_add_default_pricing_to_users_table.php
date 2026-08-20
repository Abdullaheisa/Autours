<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'default_pricing_mode')) {
                    $table->string('default_pricing_mode')->default('standard')->nullable()->after('fuel_policy_id');
                }
                if (!Schema::hasColumn('users', 'default_custom_price_tiers')) {
                    $table->json('default_custom_price_tiers')->nullable()->after('default_pricing_mode');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'default_pricing_mode')) {
                    $table->dropColumn('default_pricing_mode');
                }
                if (Schema::hasColumn('users', 'default_custom_price_tiers')) {
                    $table->dropColumn('default_custom_price_tiers');
                }
            });
        }
    }
};
