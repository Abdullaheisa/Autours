<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'logo',
        'name',
        'company',
        'gender',
        'country',
        'address',
        'email',
        'phone_num',
        'password',
        'language',
        'role',
        'city',
        'price_tax',
        'week_price_tax',
        'month_price_tax',
        'year_price_tax',
        'fuel_policy_id',
        'password_reset_key',
        'integration',
        'webhook_url'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'integration' => 'boolean',
    ];

    public function vehicles() {
        return $this->hasMany(Vehicle::class, 'id', 'supplier');
    }

    public function branches()
    {
        return $this->hasMany(Branch::class, 'id', 'company_id');
    }
    public function fuelPolicy()
    {
        return $this->belongsTo(FuelPolicy::class,'fuel_policy_id','id');
    }
    public function rentals()
    {
        return $this->hasMany(Rental::class, 'supplier_id', 'id');

    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_company_id', 'id');
    }
    public function children() {
        return $this->hasMany(User::class, 'parent_company_id', 'id');
    }
    public function paymentMethods() {
        return $this->belongsToMany(PaymentMethod::class, 'payment_method_supplier','supplier_id', 'payment_method_id');
    }

}
