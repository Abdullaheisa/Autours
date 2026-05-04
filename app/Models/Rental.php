<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rental extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'order_status',
        'order_number',
        'vehicle_id',
        'price',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'comment',
        'rate',
        'payment_method_id'
    ];

    protected $casts = [
        'rate' => 'decimal:1'
    ];
    public function vehicle() {
        return $this->belongsTo(Vehicle::class, 'vehicle_id', 'id');
    }

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id', 'id');
    }

    public function customer() {
        return $this->belongsTo(User::class, 'customer_id', 'id');
    }


    public function status() {
        return $this->belongsTo(RentalStatus::class, 'order_status', 'id');
    }
    public function rentalRates() {
        return $this->hasMany(RentalRate::class, 'rental_id', 'id');
    }
    public function paymentMethod() {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id', 'id');
    }
}
