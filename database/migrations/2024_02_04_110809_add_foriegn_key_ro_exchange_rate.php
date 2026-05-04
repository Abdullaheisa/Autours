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
        Schema::table('currency_rates', function (Blueprint $table) {
            $table->string('currency_from')->change();
            $table->double('rate');
            $table->string('currency_to')->change();
//            $table->foreign('currency_from')->on('currencies')->references('name');
//            $table->foreign('currency_to')->on('currencies')->references('name');
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
