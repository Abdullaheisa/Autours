<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;

class VehiclesPhotos extends Model
{
    use HasFactory;

    protected $fillable = [
        'photo',
        'name',
    ];

    public function vehicles(){
        return $this->hasMany(Vehicle::class, 'id', 'photo');
    }
}
