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
            if (!Schema::hasColumn('rentals', 'extras')) {
                $table->json('extras')->nullable()->after('residence_country');
            }
            if (!Schema::hasColumn('rentals', 'extras_price')) {
                $table->decimal('extras_price', 10, 2)->default(0)->after('extras');
            }
            if (!Schema::hasColumn('rentals', 'flight_number')) {
                $table->string('flight_number')->nullable()->after('extras_price');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'extras_pricing')) {
                $table->json('extras_pricing')->nullable()->after('vehicles_hidden');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            if (Schema::hasColumn('rentals', 'extras')) {
                $table->dropColumn('extras');
            }
            if (Schema::hasColumn('rentals', 'extras_price')) {
                $table->dropColumn('extras_price');
            }
            if (Schema::hasColumn('rentals', 'flight_number')) {
                $table->dropColumn('flight_number');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'extras_pricing')) {
                $table->dropColumn('extras_pricing');
            }
        });
    }
};
