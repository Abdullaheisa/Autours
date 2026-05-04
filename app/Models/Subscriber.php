<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;
use App\Models\User;

class Subscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'country',
    ];

}
