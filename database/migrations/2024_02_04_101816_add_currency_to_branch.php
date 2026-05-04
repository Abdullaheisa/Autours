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
           $table->string('currency')->nullable()->index();
        });
        Schema::table('currencies', function (Blueprint $table) {
            $table->string('name')->unique()->index()->change();
        });
        Schema::table('branches', function (Blueprint $table) {
//            $table->foreign('currency')->on('currencies')->references('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branch', function (Blueprint $table) {
            //
        });
    }
};
