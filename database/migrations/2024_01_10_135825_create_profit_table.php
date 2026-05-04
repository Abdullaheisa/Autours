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
        Schema::create('profits', function (Blueprint $table) {
            $table->id();
            $table->integer('supplier_id')->index();
            $table->float("per_day_profit");
            $table->float("per_week_profit");
            $table->float("per_month_profit");
            $table->integer("vehicle_id")->nullable()->index();
            $table->integer("branch_id")->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profit');
    }
};
