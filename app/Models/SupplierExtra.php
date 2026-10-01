<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupplierExtra extends Model
{
    use HasFactory;

    protected $table = 'supplier_extras';

    protected $fillable = [
        'supplier_id',
        'branch_id',
        'country',
        'extra_id',
        'is_enabled',
        'custom_price',
        'profit_percent',
    ];

    protected $casts = [
        'supplier_id'    => 'integer',
        'branch_id'      => 'integer',
        'country'        => 'string',
        'extra_id'       => 'integer',
        'is_enabled'     => 'boolean',
        'custom_price'   => 'float',
        'profit_percent' => 'float',
    ];

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }

    public function extra()
    {
        return $this->belongsTo(Extra::class, 'extra_id');
    }

    /**
     * Final customer price after profit margin applied to supplier's custom price
     */
    public function getCustomerPriceAttribute(): float
    {
        $base   = (float)$this->custom_price;
        $profit = (float)($this->profit_percent ?? 0);
        if ($profit > 0) {
            return round($base + ($base * $profit / 100), 2);
        }
        return round($base, 2);
    }
}
