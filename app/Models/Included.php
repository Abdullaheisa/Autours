<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Included extends Model
{
    protected $table = 'included';
    protected $fillable = ['id','what_is_included','description','discount_percent','supplier_id','status','is_promo','is_special_offer'];
    protected $casts = [
        'is_promo' => 'boolean',
        'is_special_offer' => 'boolean',
    ];
    use HasFactory;

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }
}
