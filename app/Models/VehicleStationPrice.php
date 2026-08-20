<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleStationPrice extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'branch_id',
        'day_price',
        'week_price',
        'month_price',
        'currency',
        'price_date_from',
        'price_date_to',
    ];

    protected $casts = [
        'day_price' => 'decimal:2',
        'week_price' => 'decimal:2',
        'month_price' => 'decimal:2',
        'price_date_from' => 'datetime',
        'price_date_to' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
