<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;
use App\Models\User;

class Profit extends Model
{

    protected $fillable = [
        'supplier_id',
        'per_day_profit',
        'peer_week_profit',
        'per_month_profit',
        'vehicle_id',
        'branch_id',
        'weekend_profit'
    ];

    public $timestamps = true;


}
