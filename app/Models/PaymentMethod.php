<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
    ];



    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'id', 'pickup_loc');
    }
}
