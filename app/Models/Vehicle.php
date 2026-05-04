<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory;
    use SoftDeletes;

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
        'fuel_policy_id'
    ];

    protected $casts = [
        'specifications' => 'array'
    ];

    public function category() {
        return $this->belongsTo(Category::class, 'category', 'id');
    }
    public function vehicle_category() {
        return $this->belongsTo(Category::class, 'category', 'id');
    }

    public function supplier() {
        return $this->belongsTo(User::class, 'supplier', 'id');
    }

    public function branch() {
        return $this->belongsTo(Branch::class, 'pickup_loc', 'id');
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

    public function rental_terms()
    {
        $this->rental_terms =  SupplierRentalTerm::query()->where('supplier_id', $this->supplier)->join('rental_terms','rental_terms.id', '=','supplier_rental_terms.rental_term_id')->select(['title','description'])->get();
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
}
