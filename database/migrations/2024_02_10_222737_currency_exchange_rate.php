<?php

use App\Models\CurrencyRate;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        CurrencyRate::query()->insert([
            [
                'currency_from' => 'SAR',
                'currency_to' => 'USD',
                'rate' => '0.27',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'EGP',
                'rate' => '13.55',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'AED',
                'rate' => '0.98',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'QAR',
                'rate' => '0.97',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'OMR',
                'rate' => '0.10',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'KWD',
                'rate' => '0.082',
            ],
            [
                'currency_from' => 'SAR',
                'currency_to' => 'BHD',
                'rate' => '0.10',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'QAR',
                'currency_to' => 'USD',
                'rate' => '0.27',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'EGP',
                'rate' => '14.01',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'AED',
                'rate' => '1.01',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'SAR',
                'rate' => '1.03',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'OMR',
                'rate' => '0.11',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'KWD',
                'rate' => '0.085',
            ],
            [
                'currency_from' => 'QAR',
                'currency_to' => 'BHD',
                'rate' => '0.10',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'OMR',
                'currency_to' => 'USD',
                'rate' => '2.60',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'EGP',
                'rate' => '132.23',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'AED',
                'rate' => '9.54',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'SAR',
                'rate' => '9.76',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'QAR',
                'rate' => '9.47',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'KWD',
                'rate' => '0.80',
            ],
            [
                'currency_from' => 'OMR',
                'currency_to' => 'BHD',
                'rate' => '0.98',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'KWD',
                'currency_to' => 'USD',
                'rate' => '3.25',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'EGP',
                'rate' => '165.23',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'AED',
                'rate' => '11.93',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'SAR',
                'rate' => '12.20',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'QAR',
                'rate' => '11.85',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'OMR',
                'rate' => '1.25',
            ],
            [
                'currency_from' => 'KWD',
                'currency_to' => 'BHD',
                'rate' => '1.23',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'BHD',
                'currency_to' => 'USD',
                'rate' => '2.66',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'EGP',
                'rate' => '135.02',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'AED',
                'rate' => '9.76',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'SAR',
                'rate' => '9.97',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'QAR',
                'rate' => '9.68',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'OMR',
                'rate' => '1.02',
            ],
            [
                'currency_from' => 'BHD',
                'currency_to' => 'KWD',
                'rate' => '0.82',
            ],
        ]);



        CurrencyRate::query()->insert([
            [
                'currency_from' => 'EGP',
                'currency_to' => 'SAR',
                'rate' => '0.074',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'QAR',
                'rate' => '0.072',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'OMR',
                'rate' => '0.0076',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'KWD',
                'rate' => '0.0060',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'BHD',
                'rate' => '0.0074',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'AED',
                'rate' => '0.072',
            ],
            [
                'currency_from' => 'EGP',
                'currency_to' => 'USD',
                'rate' => '0.02',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'USD',
                'currency_to' => 'SAR',
                'rate' => '3.75',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'QAR',
                'rate' => '3.64',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'OMR',
                'rate' => '0.38',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'KWD',
                'rate' => '0.31',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'BHD',
                'rate' => '0.38',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'AED',
                'rate' => '3.67',
            ],
            [
                'currency_from' => 'USD',
                'currency_to' => 'EGP',
                'rate' => '50.88',
            ],
        ]);

        CurrencyRate::query()->insert([
            [
                'currency_from' => 'AED',
                'currency_to' => 'SAR',
                'rate' => '1.02',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'QAR',
                'rate' => '0.99',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'OMR',
                'rate' => '0.10',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'KWD',
                'rate' => '0.084',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'BHD',
                'rate' => '0.10',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'USD',
                'rate' => '0.27',
            ],
            [
                'currency_from' => 'AED',
                'currency_to' => 'EGP',
                'rate' => '13.85',
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
