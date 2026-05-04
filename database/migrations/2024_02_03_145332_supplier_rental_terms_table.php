<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::dropIfExists('supplier_rental_terms');

        Schema::create('supplier_rental_terms', function (Blueprint $table) {
            $table->id();
            $table->integer('rental_term_id')->index();
            $table->integer('supplier_id')->index();
            $table->timestamps();
        });

        Schema::table('supplier_rental_terms', function (Blueprint $table) {
//            $table->foreign('rental_term_id')->on('rental_terms')->references('id');
//            $table->foreign('supplier_id')->on('users')->references('id');
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
