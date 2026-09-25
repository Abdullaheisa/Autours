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
        Schema::table('included', function (Blueprint $table) {
            if (!Schema::hasColumn('included', 'is_special_offer')) {
                $table->boolean('is_special_offer')->default(0)->after('is_promo');
            }
        });

        // Seed default special offers
        $specialOffers = [
            [
                'what_is_included' => 'Online Check-in',
                'description' => 'Skip the counter lines and complete your verification online before arrival.',
                'is_promo' => 1,
                'is_special_offer' => 1,
                'status' => 'approved',
                'supplier_id' => null,
            ],
            [
                'what_is_included' => 'Free Additional Driver',
                'description' => 'Add a second qualified driver to your rental contract completely free of charge.',
                'is_promo' => 1,
                'is_special_offer' => 1,
                'status' => 'approved',
                'supplier_id' => null,
            ],
            [
                'what_is_included' => 'Free Child Seat',
                'description' => 'Get a certified safety child seat included at zero extra cost.',
                'is_promo' => 1,
                'is_special_offer' => 1,
                'status' => 'approved',
                'supplier_id' => null,
            ],
        ];

        foreach ($specialOffers as $offer) {
            $existing = \App\Models\Included::where('what_is_included', $offer['what_is_included'])->first();
            if ($existing) {
                $existing->update([
                    'is_promo' => 1,
                    'is_special_offer' => 1,
                    'status' => 'approved',
                    'description' => $existing->description ?: $offer['description'],
                ]);
            } else {
                \App\Models\Included::create($offer);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('included', function (Blueprint $table) {
            if (Schema::hasColumn('included', 'is_special_offer')) {
                $table->dropColumn('is_special_offer');
            }
        });
    }
};
