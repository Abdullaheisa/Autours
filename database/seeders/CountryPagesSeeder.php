<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CountryPage;
use App\Models\CityPage;

class CountryPagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = __DIR__ . '/country_pages_seed.json';
        if (!file_exists($jsonPath)) {
            $this->command->error("country_pages_seed.json not found!");
            return;
        }

        $content = file_get_contents($jsonPath);
        $countries = json_decode($content, true);

        if (!is_array($countries)) {
            $this->command->error("Invalid country_pages_seed.json format!");
            return;
        }

        foreach ($countries as $slug => $c) {
            // Find existing cities created in city_pages for this country
            $matchedCityIds = CityPage::where('country_slug', $slug)
                ->orWhereRaw('LOWER(country) = ?', [strtolower($c['name'] ?? '')])
                ->pluck('id')
                ->toArray();

            $image = null;
            if (isset($c['travelInfo']['image'])) {
                $image = basename($c['travelInfo']['image']);
            }

            $data = [
                'slug' => strtolower($c['slug'] ?? $slug),
                'name' => $c['name'] ?? '',
                'code' => $c['code'] ?? null,
                'hero_badge' => $c['heroBadge'] ?? null,
                'hero_title' => $c['heroTitle'] ?? '',
                'hero_highlight' => $c['heroHighlight'] ?? '',
                'hero_lead' => $c['heroLead'] ?? null,
                'hero_bottom_title' => $c['heroBottomTitle'] ?? null,
                'travel_info' => $c['travelInfo'] ?? null,
                'steps' => $c['steps'] ?? null,
                'documents' => $c['documents'] ?? null,
                'highlights' => $c['highlights'] ?? null,
                'faqs' => $c['faqs'] ?? null,
                'selected_cities' => !empty($matchedCityIds) ? $matchedCityIds : [],
                'partners_description' => $c['partnersDescription'] ?? null,
                'cta_title' => $c['ctaTitle'] ?? null,
                'cta_description' => $c['ctaDescription'] ?? null,
                'cta_primary_text' => $c['ctaPrimaryText'] ?? 'Compare Prices',
                'cta_secondary_text' => $c['ctaSecondaryText'] ?? 'Get Expert Help',
                'meta_description' => $c['metaDescription'] ?? ($c['heroLead'] ?? null),
                'is_published' => true,
                'image' => $image,
            ];

            CountryPage::updateOrCreate(['slug' => $data['slug']], $data);
        }

        $this->command->info("Country pages seeded successfully: " . count($countries) . " countries.");
    }
}
