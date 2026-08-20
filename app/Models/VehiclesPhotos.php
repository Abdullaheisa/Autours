<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;

class VehiclesPhotos extends Model
{
    use HasFactory;
    use \App\Console\Commands\Traits\NormalizesVehicleNames;

    public function setNameAttribute($value)
    {
        if ($value !== null) {
            // Remove "or similar" suffix if present
            $value = trim(preg_replace('/(?i)\s*-?\s*\(?or similar\)?\s*/', '', $value));
            // Apply consistent title-case and normalization
            $value = $this->normalizeVehicleName($value);
        }
        $this->attributes['name'] = $value;
    }

    protected $fillable = [
        'photo',
        'name',
    ];

    public function vehicles(){
        return $this->hasMany(Vehicle::class, 'id', 'photo');
    }
}
