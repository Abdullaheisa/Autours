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
           $table->unsignedBigInteger('company_id')->change();
       });

        Schema::dropIfExists('membership_requests');
        Schema::dropIfExists('fuel');

        Schema::table('profits', function (Blueprint $table){
            $table->unsignedBigInteger('supplier_id')->change();
            $table->unsignedBigInteger('vehicle_id')->change();
            $table->unsignedBigInteger('branch_id')->change();

        });

        Schema::table('rentals', function (Illuminate\Database\Schema\Blueprint $table){
            $table->unsignedInteger('order_status')->change();

        });

        Schema::table('supplier_rental_terms', function (Blueprint $table){
            $table->unsignedBigInteger('rental_term_id')->change();
            $table->unsignedBigInteger('supplier_id')->change();

        });
        Schema::table('vehicle_included', function (Blueprint $table){
            $table->unsignedBigInteger('included_id')->change();
            $table->unsignedBigInteger('vehicle_id')->change();
        });
        Schema::table('vehicles', function (Blueprint $table){
            $table->unsignedBigInteger('supplier')->change();
            $table->unsignedBigInteger('category')->change();
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
