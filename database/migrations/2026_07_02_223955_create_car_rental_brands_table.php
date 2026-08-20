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
        Schema::create('car_rental_brands', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('display_name');
            $table->string('logo');
            $table->decimal('rating', 4, 2)->default(9.00);
            $table->integer('review_count')->default(100);
            $table->string('rating_label')->default('Excellent');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Trigger the seeder automatically
        \Illuminate\Support\Facades\Artisan::call('db:seed', [
            '--class' => 'Database\\Seeders\\CarRentalBrandsSeeder',
            '--force' => true
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('car_rental_brands');
    }
};
