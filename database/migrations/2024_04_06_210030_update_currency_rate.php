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
//
//        $tos = \App\Models\CurrencyRate::query()->where('currency_to', 'EGP')->get();
//        foreach ($tos as $to) {
//            $to->rate = $to->rate * 1.534;
//            $to->save();
//        }
//        $froms = \App\Models\CurrencyRate::query()->where('currency_from', 'EGP')->get();
//        foreach ($froms as $from) {
//            $from->rate = $from->rate / 1.534;
//            $from->save();
//        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
