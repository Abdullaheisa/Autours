<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('extras')) {
            Schema::create('extras', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->decimal('price', 10, 2)->default(0);
                $table->string('currency', 10)->default('USD');
                $table->string('type', 20)->default('boolean'); // boolean | quantity
                $table->integer('max_qty')->default(1);
                $table->string('badge', 50)->nullable();
                $table->boolean('is_active')->default(true);
                $table->unsignedBigInteger('supplier_id')->nullable()->index();
                $table->timestamps();
            });
        } else {
            Schema::table('extras', function (Blueprint $table) {
                if (!Schema::hasColumn('extras', 'key')) {
                    $table->string('key')->nullable()->after('id');
                }
                if (!Schema::hasColumn('extras', 'name')) {
                    $table->string('name')->nullable()->after('key');
                }
                if (!Schema::hasColumn('extras', 'description')) {
                    $table->text('description')->nullable()->after('name');
                }
                if (!Schema::hasColumn('extras', 'price')) {
                    $table->decimal('price', 10, 2)->default(0)->after('description');
                }
                if (!Schema::hasColumn('extras', 'currency')) {
                    $table->string('currency', 10)->default('USD')->after('price');
                }
                if (!Schema::hasColumn('extras', 'type')) {
                    $table->string('type', 20)->default('boolean')->after('currency');
                }
                if (!Schema::hasColumn('extras', 'max_qty')) {
                    $table->integer('max_qty')->default(1)->after('type');
                }
                if (!Schema::hasColumn('extras', 'badge')) {
                    $table->string('badge', 50)->nullable()->after('max_qty');
                }
                if (!Schema::hasColumn('extras', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('badge');
                }
                if (!Schema::hasColumn('extras', 'supplier_id')) {
                    $table->unsignedBigInteger('supplier_id')->nullable()->index()->after('is_active');
                }
            });
        }

        // Seed initial default extras if table is empty
        if (DB::table('extras')->count() === 0) {
            $initialExtras = [
                [
                    'key' => 'additional_driver',
                    'name' => 'Additional Driver',
                    'description' => 'Share the driving with an additional qualified driver on the rental agreement.',
                    'price' => 15.00,
                    'currency' => 'USD',
                    'type' => 'boolean',
                    'max_qty' => 1,
                    'badge' => 'Popular',
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key' => 'booster_cushion',
                    'name' => 'Booster Cushion',
                    'description' => 'For older children (approx. 4–11 years, 15–36 kg) to ensure safe seatbelt positioning.',
                    'price' => 10.00,
                    'currency' => 'USD',
                    'type' => 'quantity',
                    'max_qty' => 3,
                    'badge' => null,
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key' => 'child_booster_seat',
                    'name' => 'Child Booster Seat',
                    'description' => 'High-back booster seat suitable for children from 15 to 36 kg with side-impact protection.',
                    'price' => 12.00,
                    'currency' => 'USD',
                    'type' => 'quantity',
                    'max_qty' => 3,
                    'badge' => 'Family Favorite',
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key' => 'infant_seat',
                    'name' => 'Infant Seat',
                    'description' => 'Rear-facing safety seat designed for infants from birth up to 13 kg.',
                    'price' => 15.00,
                    'currency' => 'USD',
                    'type' => 'quantity',
                    'max_qty' => 2,
                    'badge' => null,
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key' => 'gps',
                    'name' => 'Navigation System (GPS)',
                    'description' => 'Portable satellite navigation system with up-to-date maps and voice directions.',
                    'price' => 20.00,
                    'currency' => 'USD',
                    'type' => 'boolean',
                    'max_qty' => 1,
                    'badge' => 'Recommended',
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'key' => 'toddler_seat',
                    'name' => 'Toddler Seat',
                    'description' => 'Forward-facing seat with 5-point harness for toddlers from 9 to 18 kg (approx. 9 months to 4 years).',
                    'price' => 12.00,
                    'currency' => 'USD',
                    'type' => 'quantity',
                    'max_qty' => 3,
                    'badge' => null,
                    'is_active' => true,
                    'supplier_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ];

            DB::table('extras')->insert($initialExtras);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('extras');
    }
};
