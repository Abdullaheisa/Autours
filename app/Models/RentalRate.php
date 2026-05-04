<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalRate extends Model
{
    use HasFactory;
    public function rental() {
        return $this->belongsTo(Rental::class, 'rental_id', 'id');
    }
    public function question() {
        return $this->belongsTo(RateQuestion::class, 'question_id', 'id');
    }
}
