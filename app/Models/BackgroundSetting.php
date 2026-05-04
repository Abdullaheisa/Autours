<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BackgroundSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'section_key',
        'section_name',
        'image_path',
        'default_image_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the image URL (uses custom image if set, otherwise default)
     */
    public function getImageUrlAttribute(): string
    {
        return $this->image_path ?? $this->default_image_path ?? '';
    }

    /**
     * Get all background settings as a key-value array
     */
    public static function getAllBackgrounds(): array
    {
        return self::where('is_active', true)
            ->pluck('image_path', 'section_key')
            ->map(function ($image, $key) {
                $setting = self::where('section_key', $key)->first();
                return $image ?? $setting->default_image_path ?? '';
            })
            ->toArray();
    }
}
