<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CityPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'country',
        'country_slug',
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
        'is_published' => 'boolean',
    ];
}
