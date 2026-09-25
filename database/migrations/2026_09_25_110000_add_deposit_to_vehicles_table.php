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
            if (!Schema::hasColumn('vehicles', 'deposit_amount')) {
                $table->decimal('deposit_amount', 10, 2)->nullable()->default(0)->after('price');
            }
            if (!Schema::hasColumn('vehicles', 'deposit_terms')) {
                $table->text('deposit_terms')->nullable()->after('deposit_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            if (Schema::hasColumn('vehicles', 'deposit_amount')) {
                $table->dropColumn('deposit_amount');
            }
            if (Schema::hasColumn('vehicles', 'deposit_terms')) {
                $table->dropColumn('deposit_terms');
            }
        });
    }
};
