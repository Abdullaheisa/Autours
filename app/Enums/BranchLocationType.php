<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Canonical location types for branches.
 *
 * Used by the Branch model setter to normalize incoming values
 * from supplier syncs, manual edits, and API calls.
 */
enum BranchLocationType: string
{
    case Airport = 'Airport';
    case Downtown = 'Downtown';
    case Hotel = 'Hotel';
    case Office = 'Office';
    case Port = 'Port';
    case BusTerminal = 'Bus Terminal';
    case BusStation = 'Bus Station';
    case RailwayStation = 'Railway Station';
    case Border = 'Border';

    /**
     * Resolve a raw location type string to a canonical enum value.
     *
     * Handles numeric codes, legacy aliases, casing variations, and
     * unknown values. Returns the canonical string value.
     */
    public static function resolve(mixed $raw): string
    {
        if ($raw === null || $raw === '') {
            return self::Downtown->value;
        }

        $raw = trim((string) $raw);

        // Direct match (case-insensitive)
        foreach (self::cases() as $case) {
            if (strcasecmp($case->value, $raw) === 0) {
                return $case->value;
            }
        }

        // Legacy numeric mappings
        $numericMap = [
            '1' => self::Airport->value,
            '2' => self::Downtown->value,
        ];
        if (isset($numericMap[$raw])) {
            return $numericMap[$raw];
        }

        // Alias mappings (lowercase key → canonical value)
        $aliases = [
            'city'              => self::Downtown->value,
            'busterminal'       => self::BusTerminal->value,
            'bus_terminal'      => self::BusTerminal->value,
            'bus terminal'      => self::BusTerminal->value,
            'busstation'        => self::BusStation->value,
            'bus_station'       => self::BusStation->value,
            'bus station'       => self::BusStation->value,
            'railwaystation'    => self::RailwayStation->value,
            'railway_station'   => self::RailwayStation->value,
            'railway station'   => self::RailwayStation->value,
            'train station'     => self::RailwayStation->value,
            'trainstation'      => self::RailwayStation->value,
        ];

        $lower = strtolower($raw);
        if (isset($aliases[$lower])) {
            return $aliases[$lower];
        }

        // Fallback — return as-is if it looks reasonable, default to Downtown
        return self::Downtown->value;
    }
}
