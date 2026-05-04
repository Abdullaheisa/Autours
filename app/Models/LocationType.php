<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LocationType extends Model
{
    use HasFactory;
    protected $table = 'location_types';
    public $timestamps = true;
    protected $fillable = ['name', 'icon'];
}
