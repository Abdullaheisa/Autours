<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalTerms extends Model
{
    public $timestamps = true;
    protected $fillable = ['status','title','description','created_by'];
}
