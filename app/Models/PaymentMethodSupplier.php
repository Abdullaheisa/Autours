<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethodSupplier extends Model
{
    use HasFactory;

    protected $table = 'payment_method_supplier';
    protected $fillable = [
        'supplier_id',
        'payment_method_id',
    ];
}
