<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Airport extends Model
{
    use HasFactory;

    protected $fillable = [
        'country',
        'airport_name',
        'city',
        'iata_code',
    ];

    /**
     * Get all branches linked to this airport.
     */
    public function branches()
    {
        return $this->hasMany(Branch::class, 'airport_id', 'id');
    }
}
