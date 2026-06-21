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
        'station_id',
        'currency',
        'country',
        'city',
        'lat',
        'lng',
        'location_type',
        'abriviation',
        'activation',
        'airport_id',
        'normalized_name'
    ];

    public function company() {
        return $this->belongsTo(User::class, 'company_id', 'id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'pickup_loc', 'id');
    }

    public function pivotVehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'branch_vehicle')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function airport()
    {
        return $this->belongsTo(Airport::class, 'airport_id', 'id');
    }

    public function setCountryAttribute($value)
    {
        $this->attributes['country'] = $value ? ucwords(strtolower((string)$value)) : $value;
    }
}
