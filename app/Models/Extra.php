<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Extra extends Model
{
    use HasFactory;

    protected $table = 'extras';

    protected $fillable = [
        'key',
        'name',
        'description',
        'faqs',
        'price',
        'profit_percent',
        'currency',
        'type',
        'max_qty',
        'badge',
        'is_active',
        'supplier_id',
    ];

    protected $casts = [
        'faqs' => 'array',
        'price' => 'float',
        'profit_percent' => 'float',
        'max_qty' => 'integer',
        'is_active' => 'boolean',
        'supplier_id' => 'integer',
    ];

    /**
     * Calculate customer final price after profit margin
     */
    public function getCustomerPriceAttribute(): float
    {
        $base = (float)$this->price;
        $profit = (float)($this->profit_percent ?? 0);
        if ($profit > 0) {
            return round($base + ($base * $profit / 100), 2);
        }
        return round($base, 2);
    }

    public function supplier()
    {
        return $this->belongsTo(User::class, 'supplier_id');
    }
}
