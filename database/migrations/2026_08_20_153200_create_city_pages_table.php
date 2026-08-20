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
        Schema::create('city_pages', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('country');
            $table->string('country_slug');

            // Hero section
            $table->string('hero_badge')->nullable();
            $table->string('hero_title');
            $table->string('hero_highlight');
            $table->text('hero_lead')->nullable();
            $table->string('hero_bottom_title')->nullable();

            // Travel info (JSON: title, subtitle, image, benefits[])
            $table->json('travel_info')->nullable();

            // Steps (JSON: [{title, description}])
            $table->json('steps')->nullable();

            // Documents (JSON: {items: [string]})
            $table->json('documents')->nullable();

            // Highlights / Destinations (JSON: {title, subtitle, places[]})
            $table->json('highlights')->nullable();

            // FAQs (JSON: [{q, a}])
            $table->json('faqs')->nullable();

            // Partners & CTA
            $table->text('partners_description')->nullable();
            $table->string('cta_title')->nullable();
            $table->text('cta_description')->nullable();
            $table->string('cta_primary_text')->nullable();
            $table->string('cta_secondary_text')->nullable();

            // SEO & publish
            $table->text('meta_description')->nullable();
            $table->boolean('is_published')->default(true);

            // Image for travel info section
            $table->string('image')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('city_pages');
    }
};
