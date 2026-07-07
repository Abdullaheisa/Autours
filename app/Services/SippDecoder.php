<?php

declare(strict_types=1);

namespace App\Services;

class SippDecoder
{
    /**
     * Decode a 4-character SIPP (ACRISS) code into its detailed components.
     *
     * @param string $sipp SIPP code (e.g., CDAR)
     * @return array|null Returns an array with decoded components or null if invalid.
     */
    public static function decode(string $sipp): ?array
    {
        $sipp = strtoupper(trim($sipp));

        if (strlen($sipp) !== 4) {
            return null;
        }

        return [
            'category'               => self::getCategory($sipp[0]),
            'type'                   => self::getType($sipp[1]),
            'transmission_and_drive' => self::getTransmissionAndDrive($sipp[2]),
            'fuel_and_ac'            => self::getFuelAndAc($sipp[3]),
        ];
    }

    /**
     * Get the descriptive meaning of a SIPP code as a string.
     */
    public static function describe(string $sipp): string
    {
        $decoded = self::decode($sipp);
        if (!$decoded) {
            return 'Unknown SIPP';
        }

        $desc = [];
        if ($decoded['category']) $desc[] = $decoded['category'];
        if ($decoded['type']) $desc[] = $decoded['type'];
        if ($decoded['transmission_and_drive']) $desc[] = $decoded['transmission_and_drive'];
        if ($decoded['fuel_and_ac']) $desc[] = 'with ' . $decoded['fuel_and_ac'];

        return implode(' ', $desc);
    }

    /**
     * Map the first character of a SIPP code to the Vehicle Category.
     */
    public static function getCategory(string $char): string
    {
        $map = [
            'M' => 'Mini',
            'N' => 'Mini Elite',
            'E' => 'Economy',
            'H' => 'Economy Elite',
            'C' => 'Compact',
            'D' => 'Compact Elite',
            'I' => 'Intermediate',
            'J' => 'Intermediate Elite',
            'S' => 'Standard',
            'R' => 'Standard Elite',
            'F' => 'Fullsize',
            'G' => 'Fullsize Elite',
            'P' => 'Premium',
            'U' => 'Premium Elite',
            'L' => 'Luxury',
            'W' => 'Luxury Elite',
            'O' => 'Oversize',
            'X' => 'Special',
        ];

        return $map[$char] ?? 'Unknown Category';
    }

    /**
     * Map the second character of a SIPP code to the Vehicle Type.
     */
    public static function getType(string $char): string
    {
        $map = [
            'B' => '2-3 Door',
            'C' => '2/4 Door',
            'D' => '4-5 Door',
            'W' => 'Wagon / Estate',
            'V' => 'Passenger Van',
            'L' => 'Limousine',
            'S' => 'Sport',
            'T' => 'Convertible',
            'F' => 'SUV',
            'J' => 'Open Air All Terrain',
            'X' => 'Special',
            'P' => 'Pickup Regular Cab',
            'Q' => 'Pickup Extended Cab',
            'Z' => 'Special Offer Car',
            'E' => 'Coupe',
            'M' => 'Monospace',
            'R' => 'Recreational Vehicle',
            'H' => 'Motor Home',
            'Y' => '2 Wheel Vehicle',
            'N' => 'Roadster',
            'G' => 'Crossover',
            'K' => 'Commercial Van / Truck',
        ];

        return $map[$char] ?? 'Unknown Type';
    }

    /**
     * Map the third character of a SIPP code to Transmission & Drive.
     */
    public static function getTransmissionAndDrive(string $char): string
    {
        $map = [
            'M' => 'Manual - Unspecified Drive',
            'N' => 'Manual - 4WD',
            'C' => 'Manual - AWD',
            'A' => 'Automatic - Unspecified Drive',
            'B' => 'Automatic - 4WD',
            'D' => 'Automatic - AWD',
        ];

        return $map[$char] ?? 'Unknown Transmission';
    }

    /**
     * Map the fourth character of a SIPP code to Fuel Type & Air Conditioning.
     */
    public static function getFuelAndAc(string $char): string
    {
        $map = [
            'R' => 'Unspecified Fuel/Power - Air Conditioning',
            'N' => 'Unspecified Fuel/Power - No Air Conditioning',
            'D' => 'Diesel - Air Conditioning',
            'Q' => 'Diesel - No Air Conditioning',
            'H' => 'Hybrid - Air Conditioning',
            'I' => 'Hybrid - No Air Conditioning',
            'E' => 'Electric - Air Conditioning',
            'C' => 'Electric - No Air Conditioning',
            'L' => 'LPG / Compressed Gas - Air Conditioning',
            'A' => 'Hydrogen - Air Conditioning',
            'B' => 'Hydrogen - No Air Conditioning',
            'M' => 'Multi Fuel/Power - Air Conditioning',
            'F' => 'Multi Fuel/Power - No Air Conditioning',
            'V' => 'Petrol - Air Conditioning',
            'Z' => 'Petrol - No Air Conditioning',
            'U' => 'Ethanol - Air Conditioning',
            'X' => 'Ethanol - No Air Conditioning',
        ];

        return $map[$char] ?? 'Unknown Fuel/AC';
    }

    public static function getLocalCategoryName(string $sipp): string
    {
        if (strlen($sipp) < 1) {
            return 'Economy';
        }

        $char1 = strtoupper($sipp[0]);
        $char2 = strlen($sipp) >= 2 ? strtoupper($sipp[1]) : '';

        // Prioritize the second character (Vehicle Type) for Vans and SUVs
        if (in_array($char2, ['V', 'M', 'K'])) {
            return 'Minivan';
        }
        if (in_array($char2, ['F', 'G', 'J'])) {
            return 'SUV';
        }

        $map = [
            'M' => 'Mini',
            'N' => 'Mini',
            'E' => 'Economy',
            'H' => 'Economy',
            'C' => 'Compact', // Standard in older code, but Compact might exist? Let's default to Standard to be backward compatible if needed
            'D' => 'Standard',
            'I' => 'Standard',
            'J' => 'Standard',
            'S' => 'Standard',
            'R' => 'SUV', // Found in SyncRentlyVehicles R => SUV
            'T' => 'Standard',
            'F' => 'Full Size',
            'G' => 'Full Size',
            'P' => 'Luxury',
            'U' => 'Luxury',
            'L' => 'Luxury',
            'W' => 'Luxury',
            'O' => 'Luxury',
            'X' => 'SUV', // X mapped to SUV in old code
            'K' => 'Minivan',
            'V' => 'Minivan',
        ];

        // The older scripts mapped C, D, I, J, S, T to 'Standard'. Let's maintain that backward compatibility or return 'Standard'
        if ($char1 === 'C') return 'Standard'; 

        return $map[$char1] ?? 'Economy';
    }

    /**
     * Map SIPP code to local Fuel name.
     */
    public static function getLocalFuelName(string $sipp): string
    {
        if (strlen($sipp) < 4) {
            return 'Petrol';
        }

        $char = strtoupper($sipp[3]);

        return match ($char) {
            'E', 'C' => 'Electric',
            'H', 'I', 'L' => 'Hybrid Petrol & Gas',
            'M', 'F' => 'Hybrid Petrol & Gas',
            'D', 'Q' => 'Petrol', // Diesel historically mapped to Petrol in this app
            'V', 'Z' => 'Petrol',
            default => 'Petrol',
        };
    }
    
    /**
     * Map SIPP code to local Transmission name.
     */
    public static function getLocalTransmissionName(string $sipp): string
    {
        if (strlen($sipp) < 3) {
            return 'Manual';
        }

        $char = strtoupper($sipp[2]);

        return match ($char) {
            'A', 'B', 'D' => 'Automatic',
            'M', 'N', 'C' => 'Manual',
            default => 'Manual',
        };
    }

    /**
     * Map SIPP code to local Air Conditioning info.
     */
    public static function getLocalAcName(string $sipp): string
    {
        if (strlen($sipp) < 4) {
            return 'Air Conditioning';
        }

        $char = strtoupper($sipp[3]);

        // SIPP 4th character mapping:
        // AC chars: R, D, H, E, L, A, M, V, U
        // No AC chars: N, Q, I, C, B, F, Z, X
        $acChars = ['R', 'D', 'H', 'E', 'L', 'A', 'M', 'V', 'U'];
        
        return in_array($char, $acChars) ? 'Air Conditioning' : 'No AC';
    }
}
