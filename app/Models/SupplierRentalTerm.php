<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierRentalTerm extends Model
{
    public $timestamps = true;
    protected $table = 'supplier_rental_terms';
    protected $fillable = ['rental_term_id', 'supplier_id'];
}
