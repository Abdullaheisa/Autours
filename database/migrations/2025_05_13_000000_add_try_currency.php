<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $exists = \App\Models\Currency::query()->where('name', 'TRY')->exists();

        if (! $exists) {
            \App\Models\Currency::query()->insert([
                'name' => 'TRY',
                'country' => 'Turkey',
                'flag' => 'TR',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\Currency::query()->where('name', 'TRY')->delete();
        \App\Models\CurrencyRate::query()
            ->where('currency_from', 'TRY')
            ->orWhere('currency_to', 'TRY')
            ->delete();
    }
};
