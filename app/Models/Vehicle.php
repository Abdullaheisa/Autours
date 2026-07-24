<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory;
    use SoftDeletes;

    use \App\Console\Commands\Traits\NormalizesVehicleNames;

    public function setNameAttribute($value)
    {
        if ($value !== null) {
            // Remove "or similar" suffix from supplier names
            $value = trim(preg_replace('/(?i)\s*-?\s*\(?or similar\)?\s*/', '', $value));
            // Apply consistent title-case and transmission normalization
            $value = $this->normalizeVehicleName($value);
        }
        $this->attributes['name'] = $value;
    }


    protected $fillable = [
        'photo',
        'name',
        'supplier',
        'price',
        'week_price',
        'month_price',
        'pickup_loc',
        'activation',
        'category',
        'specifications',
        'description',
        'fuel_policy_id',
        'negotiation_status',
        'negotiation_notes',
        'negotiation_priority',
        'instant_confirmation'
    ];

    protected $casts = [
        'specifications' => 'array'
    ];

    protected $appends = [
        'rental_terms'
    ];

    public function category() {
        return $this->belongsTo(Category::class, 'category', 'id');
    }
    public function vehicle_category() {
        return $this->belongsTo(Category::class, 'category', 'id');
    }

    public function supplierUser() {
        return $this->belongsTo(User::class, 'supplier', 'id');
    }

    public function branch() {
        return $this->belongsTo(Branch::class, 'pickup_loc', 'id');
    }

    public function branches() {
        return $this->belongsToMany(Branch::class, 'branch_vehicle')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function rentals(){
        return $this->hasMany(Rental::class, 'vehicle_id', 'id');
    }

    public function locationType(){
        return $this->belongsToMany(LocationType::class, 'location_type_vehicle','vehicle_id','location_type_id');
    }


    public function profit(){
        return $this->hasOne(Profit::class, 'vehicle_id', 'id');
    }

    public function included(){
        return $this->belongsToMany(Included::class, 'vehicle_included','vehicle_id','included_id');
    }

    public function getRentalTermsAttribute()
    {
        $supplierId = $this->attributes['supplier'] ?? ($this->getAttributes()['supplier'] ?? null);
        if (!$supplierId && $this->relationLoaded('supplierUser')) {
            $supplierId = $this->supplierUser ? $this->supplierUser->id : null;
        }
        
        if (!$supplierId) {
            return [];
        }

        // جلب الفرع والدولة المحددة للسيارة
        $branch = $this->branch;
        $country = $branch ? trim($branch->country) : null;

        $query = SupplierRentalTerm::query()
            ->where('supplier_rental_terms.supplier_id', $supplierId)
            ->join('rental_terms', 'rental_terms.id', '=', 'supplier_rental_terms.rental_term_id');

        if ($country) {
            $normalizedCountry = \App\Services\CountryCurrencyResolver::normalizeCountryName($country);
            $query->where(function($q) use ($country, $normalizedCountry) {
                $q->whereRaw('LOWER(supplier_rental_terms.country) = ?', [strtolower($country)])
                  ->orWhereRaw('LOWER(supplier_rental_terms.country) = ?', [strtolower($normalizedCountry)])
                  ->orWhereRaw('LOWER(rental_terms.country) = ?', [strtolower($country)])
                  ->orWhereRaw('LOWER(rental_terms.country) = ?', [strtolower($normalizedCountry)]);
            });
        }

        return $query->select(['rental_terms.title', 'rental_terms.description'])
            ->get();
    }
    public function specifications()
    {
        return $this->hasMany(VehicleSpecification::class, 'vehicle_id','id')->orderBy('name');
    }
    public function vehicle_specifications()
    {
        return $this->hasMany(VehicleSpecification::class, 'vehicle_id','id')->orderBy('name');
    }
    public function fuelPolicy()
    {
        return $this->belongsTo(FuelPolicy::class,'fuel_policy_id','id');
    }

    public function vehiclePhoto()
    {
        return $this->belongsTo(VehiclesPhotos::class, 'photo', 'id');
    }

    public function toArray()
    {
        $array = parent::toArray();
        if (array_key_exists('supplier_user', $array)) {
            $array['supplier'] = $array['supplier_user'];
            unset($array['supplier_user']);
        } elseif ($this->relationLoaded('supplierUser')) {
            $array['supplier'] = $this->supplierUser ? $this->supplierUser->toArray() : null;
        }
        return $array;
    }
}
