<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContestRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'country',
        'campaign_version'
    ];

    protected $casts = [
        'campaign_version' => 'integer'
    ];
}
