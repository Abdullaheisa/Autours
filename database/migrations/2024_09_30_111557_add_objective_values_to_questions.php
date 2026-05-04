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
        Schema::table('questions', function (Blueprint $table) {
           \App\Models\RateQuestion::query()->find(1)->update(['objective' => 'Company Proficiency']);
           \App\Models\RateQuestion::query()->find(2)->update(['objective' => 'Trust']);
           \App\Models\RateQuestion::query()->find(3)->update(['objective' => 'Car Condition']);
           \App\Models\RateQuestion::query()->find(4)->update(['objective' => 'Ease of Pick-up and Drop-off']);
           \App\Models\RateQuestion::query()->find(5)->update(['objective' => 'Locating supplier Desk']);
           \App\Models\RateQuestion::query()->find(6)->update(['objective' => 'Value For Money']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            //
        });
    }
};
