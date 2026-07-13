<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected static function booted()
    {
        static::saving(function ($branch) {
            $nameLower = strtolower($branch->name ?? '');

            // 1. Detect location type
            if (empty($branch->location_type) && (strpos($nameLower, 'airport') !== false || strpos($nameLower, ' apt') !== false)) {
                $branch->location_type = 'Airport';
            }

            // 2. Extract IATA code from parentheses like (MCT) or (DXB) if missing or numeric
            if (empty($branch->abriviation) || is_numeric($branch->abriviation)) {
                if (preg_match('/\(([A-Za-z]{3})\)/', $branch->name, $matches)) {
                    $branch->abriviation = strtoupper($matches[1]);
                }
            }

            // 3. Fallback: Identify well-known airports by name if still no abbreviation
            if (empty($branch->abriviation) || is_numeric($branch->abriviation)) {
                $knownAirports = [
                    'muscat' => 'MCT',
                    'salalah' => 'SLL',
                    'dubai international' => 'DXB',
                    'al maktoum' => 'DWC',
                    'abu dhabi' => 'AUH',
                    'sharjah' => 'SHJ',
                    'amman' => 'AMM',
                    'queen alia' => 'AMM',
                    'aqaba' => 'AQJ',
                    'cairo' => 'CAI',
                    'hurghada' => 'HRG',
                    'sharm' => 'SSH',
                    'alexandria' => 'HBE',
                    'borg el arab' => 'HBE',
                    'kuwait' => 'KWI',
                    'bahrain' => 'BAH',
                    'doha' => 'DOH',
                    'hamad' => 'DOH'
                ];

                if (strpos($nameLower, 'airport') !== false || strpos($nameLower, ' apt') !== false) {
                    foreach ($knownAirports as $keyword => $code) {
                        if (strpos($nameLower, $keyword) !== false) {
                            $branch->abriviation = $code;
                            $branch->location_type = 'Airport';
                            break;
                        }
                    }
                }
            }
        });
    }

    protected $fillable = [
        'name',
        'location',
        'adresse',
        'company_id',
        'station_id',
        'currency',
        'country',
        'city',
        'lat',
        'lng',
        'location_type',
        'abriviation',
        'activation',
        'airport_id',
        'normalized_name'
    ];

    public function company() {
        return $this->belongsTo(User::class, 'company_id', 'id');
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class, 'pickup_loc', 'id');
    }

    public function pivotVehicles()
    {
        return $this->belongsToMany(Vehicle::class, 'branch_vehicle')
            ->withPivot('is_primary')
            ->withTimestamps();
    }

    public function airport()
    {
        return $this->belongsTo(Airport::class, 'airport_id', 'id');
    }

    public function setCountryAttribute($value)
    {
        $this->attributes['country'] = $value ? ucwords(strtolower((string)$value)) : $value;
    }
}
