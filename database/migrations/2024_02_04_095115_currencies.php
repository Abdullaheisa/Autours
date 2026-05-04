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
       Schema::create('currencies', function (Blueprint $table){
           $table->id();
           $table->string('name');
           $table->string('country');
           $table->timestamps();
       });

        Schema::create('currency_rates', function (Blueprint $table){
            $table->id();
            $table->integer('currency_from')->index();
            $table->integer('currency_to')->index();
            $table->timestamps();
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
