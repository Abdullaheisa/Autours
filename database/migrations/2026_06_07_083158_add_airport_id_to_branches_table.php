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
        Schema::table('branches', function (Blueprint $table) {
            $table->unsignedBigInteger('airport_id')->nullable()->after('station_id');
            $table->string('normalized_name')->nullable()->after('name');
            $table->foreign('airport_id')->references('id')->on('airports')->nullOnDelete();
            $table->index('airport_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropForeign(['airport_id']);
            $table->dropIndex(['airport_id']);
            $table->dropColumn(['airport_id', 'normalized_name']);
        });
    }
};
