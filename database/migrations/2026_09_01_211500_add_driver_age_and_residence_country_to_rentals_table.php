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
        Schema::table('rentals', function (Blueprint $table) {
            if (!Schema::hasColumn('rentals', 'driver_age')) {
                $table->string('driver_age')->nullable()->after('currency');
            }
            if (!Schema::hasColumn('rentals', 'residence_country')) {
                $table->string('residence_country')->nullable()->after('driver_age');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            if (Schema::hasColumn('rentals', 'driver_age')) {
                $table->dropColumn('driver_age');
            }
            if (Schema::hasColumn('rentals', 'residence_country')) {
                $table->dropColumn('residence_country');
            }
        });
    }
};
