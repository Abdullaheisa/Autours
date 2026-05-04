<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationTypeVehicle extends Model
{
    use HasFactory;
    protected $table = 'location_type_vehicle';
    public $timestamps = true;
}
