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
        Schema::table('branches', function (Blueprint $table){
            $table->foreign('company_id')->references('id')->on('users');
        });


        Schema::table('profits', function (Blueprint $table){


            $table->foreign('supplier_id')->references('id')->on('users');
            $table->foreign('vehicle_id')->references('id')->on('vehicles');
            $table->foreign('branch_id')->references('id')->on('branches');
        });

        Schema::table('rentals', function (Blueprint $table){


            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('order_status')->references('id')->on('rental_statuses');
            $table->foreign('vehicle_id')->references('id')->on('vehicles');
        });

        Schema::table('supplier_rental_terms', function (Blueprint $table){

            $table->foreign('rental_term_id')->references('id')->on('rental_terms');
            $table->foreign('supplier_id')->references('id')->on('users');
        });
        Schema::table('vehicle_included', function (Blueprint $table){
            $table->foreign('included_id')->references('id')->on('included');
            $table->foreign('vehicle_id')->references('id')->on('vehicles');
        });
        Schema::table('vehicles', function (Blueprint $table){
            $table->foreign('supplier')->references('id')->on('users');
            $table->foreign('category')->references('id')->on('categories');
        });
        Schema::table('vehicle_specifications', function (Blueprint $table){
            $table->foreign('vehicle_id')->references('id')->on('vehicles');
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
