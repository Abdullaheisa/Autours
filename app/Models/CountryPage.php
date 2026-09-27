<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CountryPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'code',
        'hero_badge',
        'hero_title',
        'hero_highlight',
        'hero_lead',
        'hero_bottom_title',
        'travel_info',
        'steps',
        'documents',
        'highlights',
        'faqs',
        'selected_cities',
        'partners_description',
        'cta_title',
        'cta_description',
        'cta_primary_text',
        'cta_secondary_text',
        'meta_description',
        'is_published',
        'image',
    ];

    protected $casts = [
        'travel_info' => 'array',
        'steps' => 'array',
        'documents' => 'array',
        'highlights' => 'array',
        'faqs' => 'array',
        'selected_cities' => 'array',
        'is_published' => 'boolean',
    ];

    protected $appends = ['cities'];

    /**
     * Get the city models included inside this country.
     */
    public function getCitiesAttribute()
    {
        // If the admin has explicitly selected city IDs (array)
        if (is_array($this->selected_cities)) {
            if (empty($this->selected_cities)) {
                return [];
            }
            return CityPage::whereIn('id', $this->selected_cities)
                ->where('is_published', true)
                ->orderBy('name', 'asc')
                ->get();
        }

        // Fallback when selected_cities is null: include cities matching the country slug/name
        return CityPage::where(function ($query) {
                $query->where('country_slug', $this->slug)
                      ->orWhereRaw('LOWER(country) = ?', [strtolower($this->name)]);
            })
            ->where('is_published', true)
            ->orderBy('name', 'asc')
            ->get();
    }
}
