<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory;
        use SoftDeletes;
    protected $fillable = [
        'name',
        'location',
        'adresse',
        'company_id',
        'currency',
        'country',
        'lat',
        'lng',
        'location_type'
    ];

    public function company() {
        return $this->belongsTo(User::class, 'company_id', 'id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'id', 'pickup_loc');
    }
}
