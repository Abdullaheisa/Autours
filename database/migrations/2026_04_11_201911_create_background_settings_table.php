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
        Schema::create('background_settings', function (Blueprint $table) {
            $table->id();
            $table->string('section_key')->unique(); // e.g., 'banner', 'our_fleet', 'be_supplier', 'offers'
            $table->string('section_name'); // Human-readable name
            $table->string('image_path')->nullable();
            $table->string('default_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('background_settings');
    }
};
