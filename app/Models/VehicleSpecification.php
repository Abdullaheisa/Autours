<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleSpecification extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'vehicle_id',
        'name',
        'value',
        'icon',
    ];
}
