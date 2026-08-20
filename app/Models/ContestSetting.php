<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContestSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'enabled',
        'campaign_version',
        'force_interaction',
        'banner'
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'force_interaction' => 'boolean',
        'campaign_version' => 'integer'
    ];
}
