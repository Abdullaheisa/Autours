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
        $blockNonAirports = function ($branch) {
            if (app()->runningInConsole()) {
                $command = $_SERVER['argv'][1] ?? '';
                if (strpos($command, ':sync-branches') !== false) {
                    // Check if it's not an Airport (case-insensitive)
                    if (strtolower($branch->location_type) !== 'airport') {
                        return false;
                    }
                }
            }
        };

        static::creating($blockNonAirports);
        static::updating($blockNonAirports);

        static $normalizer = null;

        static::saving(function ($branch) use (&$normalizer) {
            // If we already definitively have an airport_id, ensure location_type is correct
            if (!empty($branch->airport_id)) {
                $branch->location_type = 'Airport';
                return;
            }

            if (!$normalizer) {
                $normalizer = new \App\Services\BranchNormalizationService();
            }

            $normData = $normalizer->normalize(
                $branch->name ?? '',
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );

            if ($normData['airport_id'] !== null) {
                $branch->airport_id = $normData['airport_id'];
                $branch->location_type = 'Airport';
                if (!empty($normData['abriviation'])) {
                    $branch->abriviation = $normData['abriviation'];
                }
            } else {
                $branch->location_type = 'Downtown';
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
