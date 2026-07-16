<?php

namespace App\Models;

use App\Enums\BranchLocationType;
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
            $isRoad = strpos($nameLower, 'airport rd') !== false || strpos($nameLower, 'airport road') !== false;

            // 1. Detect location type
            if (empty($branch->location_type) && !$isRoad && (strpos($nameLower, 'airport') !== false || strpos($nameLower, ' apt') !== false || strpos($nameLower, 'havaliman') !== false)) {
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
                    // Oman
                    'muscat' => 'MCT',
                    'salalah' => 'SLL',
                    // UAE
                    'dubai international' => 'DXB',
                    'al maktoum' => 'DWC',
                    'abu dhabi' => 'AUH',
                    'sharjah' => 'SHJ',
                    'ras al khaimah' => 'RKT',
                    // Jordan
                    'amman' => 'AMM',
                    'queen alia' => 'AMM',
                    'aqaba' => 'AQJ',
                    // Egypt
                    'cairo' => 'CAI',
                    'hurghada' => 'HRG',
                    'sharm' => 'SSH',
                    'alexandria' => 'HBE',
                    'borg el arab' => 'HBE',
                    // Kuwait, Bahrain, Qatar
                    'kuwait' => 'KWI',
                    'bahrain' => 'BAH',
                    'doha' => 'DOH',
                    'hamad' => 'DOH',
                    // Morocco
                    'casablanca' => 'CMN',
                    'mohammed v' => 'CMN',
                    'marrakech' => 'RAK',
                    'marrakesh' => 'RAK',
                    'agadir' => 'AGA',
                    'rabat' => 'RBA',
                    'tangier' => 'TNG',
                    'tanger' => 'TNG',
                    'fes' => 'FEZ',
                    'nador' => 'NDR',
                    'oujda' => 'OUD',
                    // Turkey
                    'istanbul' => 'IST',
                    'sabiha' => 'SAW',
                    'antalya' => 'AYT',
                    'izmir' => 'ADB',
                    'adnan menderes' => 'ADB',
                    'ankara' => 'ESB',
                    'trabzon' => 'TZX',
                    'dalaman' => 'DLM',
                    'bodrum' => 'BJV',
                    'milas' => 'BJV',
                    'gaziantep' => 'GZT',
                    'adana' => 'ADA',
                    'kayseri' => 'ASR',
                    'konya' => 'KYA',
                    'samsun' => 'SZF',
                    'sinop' => 'NOP',
                    'van' => 'VAN',
                    'diyarbakir' => 'DIY',
                    // Saudi Arabia
                    'riyadh' => 'RUH',
                    'king khalid' => 'RUH',
                    'jeddah' => 'JED',
                    'king abdulaziz' => 'JED',
                    'dammam' => 'DMM',
                    'king fahd' => 'DMM',
                    'medina' => 'MED',
                    'prince mohammad' => 'MED',
                    // Greece
                    'athens' => 'ATH',
                    'thessaloniki' => 'SKG',
                    'heraklion' => 'HER',
                    'chania' => 'CHQ',
                    'rhodes' => 'RHO',
                    'corfu' => 'CFU',
                    'kos' => 'KGS',
                    'mykonos' => 'JMK',
                    'santorini' => 'JTR',
                    'zakynthos' => 'ZTH',
                    'kalamata' => 'KLX',
                    'kavala' => 'KVA',
                    'preveza' => 'PVK',
                    'volos' => 'VOL',
                    // Cyprus
                    'larnaca' => 'LCA',
                    'paphos' => 'PFO',
                    'ercan' => 'ECN',
                    // Georgia
                    'tbilisi' => 'TBS',
                    'batumi' => 'BUS',
                    'kutaisi' => 'KUT',
                    // Croatia
                    'zagreb' => 'ZAG',
                    'split' => 'SPU',
                    'dubrovnik' => 'DBV',
                    'zadar' => 'ZAD',
                    'pula' => 'PUY',
                    // Montenegro
                    'podgorica' => 'TGD',
                    'tivat' => 'TIV',
                    // Albania
                    'tirana' => 'TIA',
                    'rinas' => 'TIA',
                ];

                if (!$isRoad && (strpos($nameLower, 'airport') !== false || strpos($nameLower, ' apt') !== false || strpos($nameLower, 'havaliman') !== false)) {
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

    /**
     * Normalize location_type on write to prevent junk values.
     *
     * Maps numeric codes, legacy aliases, and casing variations
     * to canonical values via BranchLocationType enum.
     */
    public function setLocationTypeAttribute($value)
    {
        $this->attributes['location_type'] = BranchLocationType::resolve($value);
    }

    /**
     * Get the IATA airport code for this branch.
     *
     * The `abriviation` field may contain either a 3-letter IATA code
     * or a longer supplier station code (e.g., ADAB, TR-IST-SAW).
     * This accessor returns a clean IATA code when available.
     */
    public function getIataCodeAttribute(): ?string
    {
        // Check if abriviation is a 3-letter IATA code
        if ($this->abriviation && preg_match('/^[A-Z]{3}$/', $this->abriviation)) {
            return $this->abriviation;
        }

        // Fall back to the linked airport's IATA code
        return $this->airport?->iata_code;
    }
}
