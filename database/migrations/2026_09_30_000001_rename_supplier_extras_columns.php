<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('supplier_extras', function (Blueprint $table) {
            // Rename price → custom_price
            if (Schema::hasColumn('supplier_extras', 'price') && !Schema::hasColumn('supplier_extras', 'custom_price')) {
                $table->renameColumn('price', 'custom_price');
            }
            // Rename is_active → is_enabled (and default to false: supplier must explicitly enable)
            if (Schema::hasColumn('supplier_extras', 'is_active') && !Schema::hasColumn('supplier_extras', 'is_enabled')) {
                $table->renameColumn('is_active', 'is_enabled');
            }
        });

        // Drop currency column (currency comes from the extra catalog)
        Schema::table('supplier_extras', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_extras', 'currency')) {
                $table->dropColumn('currency');
            }
        });

        // Change default of is_enabled to false
        Schema::table('supplier_extras', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_extras', 'is_enabled')) {
                $table->boolean('is_enabled')->default(false)->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('supplier_extras', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_extras', 'custom_price') && !Schema::hasColumn('supplier_extras', 'price')) {
                $table->renameColumn('custom_price', 'price');
            }
            if (Schema::hasColumn('supplier_extras', 'is_enabled') && !Schema::hasColumn('supplier_extras', 'is_active')) {
                $table->renameColumn('is_enabled', 'is_active');
            }
            if (!Schema::hasColumn('supplier_extras', 'currency')) {
                $table->string('currency', 10)->default('USD');
            }
        });
    }
};
