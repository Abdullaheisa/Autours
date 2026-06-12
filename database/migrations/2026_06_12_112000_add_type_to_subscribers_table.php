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
        if (Schema::hasTable('subscribers')) {
            if (!Schema::hasColumn('subscribers', 'type')) {
                Schema::table('subscribers', function (Blueprint $table) {
                    $table->string('type')->default('offers');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('subscribers')) {
            if (Schema::hasColumn('subscribers', 'type')) {
                Schema::table('subscribers', function (Blueprint $table) {
                    $table->dropColumn('type');
                });
            }
        }
    }
};
