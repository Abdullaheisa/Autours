<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FleetVehicle extends Model
{
    use HasFactory;

    protected $table = 'fleet_vehicles';

    protected $fillable = [
        'category_name',
        'badge',
        'car_name',
        'photo',
        'price',
        'currency',
        'supplier_name',
        'seats',
        'doors',
        'luggage',
        'description',
        'order',
        'active',
    ];

    protected $casts = [
        'price' => 'float',
        'order' => 'integer',
        'active' => 'boolean',
    ];
}
