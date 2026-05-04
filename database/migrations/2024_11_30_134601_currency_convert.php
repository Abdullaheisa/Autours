<?php

use App\Models\Currency;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Currency::insert([
            'name' => 'MAD',
            'country' => 'Morocco',
            'flag' => 'MA'
        ]);
        \App\Models\CurrencyRate::query()->insert([
            [
                'currency_from' => 'MAD',
                'currency_to' => 'USD',
                'rate' => "0.10"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'AED',
                'rate' => "0.37"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'SAR',
                'rate' => "0.38"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'KWD',
                'rate' => "0.031"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'BHD',
                'rate' => "0.038"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'QAR',
                'rate' => "0.36"
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'EGP',
                'rate' => "5.08"
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'MAD',
                'rate' => "0.20"
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'MAD',
                'rate' => "10"
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'MAD',
                'rate' => "2.66"
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'MAD',
                'rate' => "2.74"
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'MAD',
                'rate' => "25.92"
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'MAD',
                'rate' => "32.45"
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'MAD',
                'rate' => "26.51"
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'MAD',
                'rate' => "2.72"
            ]
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
