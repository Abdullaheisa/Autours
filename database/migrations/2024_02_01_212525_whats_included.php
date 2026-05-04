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
        Schema::dropIfExists('included');

        Schema::create('included', function (Blueprint $table) {
            $table->id();
            $table->text('what_is_included');
            $table->timestamps();
        });
        Schema::dropIfExists('vehicle_included');


        Schema::create('vehicle_included', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('included_id')->index();
            $table->bigInteger('vehicle_id')->index();
            $table->timestamps();
        });
        Schema::table('vehicle_included', function (Blueprint $table) {
//          $table->foreign('included_id')->references('id')->on('included');
//          $table->foreign('vehicle_id')->references('id')->on('vehicles');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
