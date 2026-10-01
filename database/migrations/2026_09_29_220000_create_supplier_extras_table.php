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
        if (!Schema::hasTable('supplier_extras')) {
            Schema::create('supplier_extras', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('supplier_id')->index();
                $table->unsignedBigInteger('extra_id')->index();
                $table->boolean('is_enabled')->default(false);   // Whether supplier offers this extra
                $table->decimal('custom_price', 10, 2)->default(0); // Supplier's price for this extra
                $table->decimal('profit_percent', 5, 2)->default(0); // Platform profit markup %
                $table->timestamps();

                $table->unique(['supplier_id', 'extra_id']);
            });
        } else {
            // If table exists but uses old column names, migrate them
            Schema::table('supplier_extras', function (Blueprint $table) {
                if (Schema::hasColumn('supplier_extras', 'price') && !Schema::hasColumn('supplier_extras', 'custom_price')) {
                    $table->renameColumn('price', 'custom_price');
                }
                if (Schema::hasColumn('supplier_extras', 'is_active') && !Schema::hasColumn('supplier_extras', 'is_enabled')) {
                    $table->renameColumn('is_active', 'is_enabled');
                }
                if (Schema::hasColumn('supplier_extras', 'currency')) {
                    $table->dropColumn('currency');
                }
                if (!Schema::hasColumn('supplier_extras', 'is_enabled')) {
                    $table->boolean('is_enabled')->default(false)->after('extra_id');
                }
                if (!Schema::hasColumn('supplier_extras', 'custom_price')) {
                    $table->decimal('custom_price', 10, 2)->default(0);
                }
            });
        }

        // Make price and currency optional on extras table (catalog definitions don't require a price)
        Schema::table('extras', function (Blueprint $table) {
            if (Schema::hasColumn('extras', 'price')) {
                $table->decimal('price', 10, 2)->nullable()->change();
            }
            if (Schema::hasColumn('extras', 'currency')) {
                $table->string('currency', 10)->nullable()->change();
            }
            if (!Schema::hasColumn('extras', 'profit_percent')) {
                $table->decimal('profit_percent', 5, 2)->default(0)->after('price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supplier_extras');
    }
};
