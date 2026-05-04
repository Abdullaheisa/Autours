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
        \App\Models\Currency::query()->insert([
            'name' => 'JOD',
            'country' => 'Jordan',
            'flag' => 'JO',
        ]);
        \App\Models\CurrencyRate::query()->insert([
            [
                'currency_from' => 'SAR',
                'currency_to' => 'JOD',
                'rate' => '0.19',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'JOD',
                'rate' => '1.84',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'JOD',
                'rate' => '0.19',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'JOD',
                'rate' => '2.30',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'JOD',
                'rate' => '1.88',
            ],
            [
                'currency_from' => 'MAD',
                'currency_to' => 'JOD',
                'rate' => '0.071',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'JOD',
                'rate' => '0.71',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'JOD',
                'rate' => '0.014',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'JOD',
                'rate' => '0.19',
            ],


            [
                'currency_from' => 'JOD',
                'currency_to' => 'SAR',
                'rate' => '5.30',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'OMR',
                'rate' => '0.54',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'QAR',
                'rate' => '5.13',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'KWD',
                'rate' => '0.43',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'BHD',
                'rate' => '0.53',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'MAD',
                'rate' => '14.14',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'USD',
                'rate' => '1.41',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'EGP',
                'rate' => '71.79',
            ],
            [
                'currency_from' => 'JOD',
                'currency_to' => 'AED',
                'rate' => '5.18',
            ],

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
