<?php

declare(strict_types=1);

namespace App\Console\Commands\Traits;

trait NormalizesVehicleNames
{
    /**
     * Words that should remain fully UPPERCASE (brand acronyms, common abbreviations).
     */
    private static array $uppercaseWords = [
        // Brand abbreviations
        'BMW', 'VW', 'MG', 'BYD', 'GAC', 'JAC', 'FAW', 'MAN',
        // Vehicle type / drivetrain
        'SUV', 'AWD', 'FWD', 'RWD', '4WD', '4X4',
        // Mercedes model lines
        'GLA', 'GLC', 'GLE', 'GLS', 'GLB', 'CLA', 'CLK', 'SLK', 'AMG',
        // Performance / engine abbreviations
        'GT', 'RS', 'ST', 'GTI', 'TDI', 'TSI', 'DSG', 'CVT', 'CDI', 'HDI', 'TFSI',
        // Trim / edition abbreviations
        'SE', 'LE', 'XL', 'XE', 'XF',
        // Model codes (Honda, Subaru, Toyota, MG, Mitsubishi, Nissan, Mazda)
        'CRV', 'HRV', 'BRV', 'WRX', 'STI', 'RAV4', 'CR-V', 'HR-V', 'C-HR', 'BR-V',
        'ZS', 'RX', 'ASX', 'XV', 'NV', 'CX', 'RVR',
    ];

    /**
     * Normalize a vehicle name to consistent title case with proper transmission.
     *
     * Examples:
     *   "CHEVROLET CRUZE AUT"       → "Chevrolet Cruze Automatic"
     *   "hyundai i10 manual"        → "Hyundai I10 Manual"
     *   "BMW X3 AUTOMATIC"          → "BMW X3 Automatic"
     *   "toyota corolla or similar" → "Toyota Corolla"
     */
    protected function normalizeVehicleName(string $name): string
    {
        if (empty($name)) {
            return $name;
        }

        // Normalize transmission types often appended to car names
        // Matches whole words like AUT, AUTO, AUTOMATIC, AUTOMATiC (case-insensitive)
        $name = preg_replace('/\b(?:AUT|AUTO|AUTOMATIC)\b/i', 'Automatic', $name);
        
        // Matches whole words like MANUAL (case-insensitive), but NOT the standalone "MAN" word
        // to avoid matching brand names like "MAN" trucks
        $name = preg_replace('/\bMANUAL\b/i', 'Manual', $name);

        // Remove Roman numerals indicating generation (e.g. II, III, IV, VI)
        // Only uppercase to avoid matching partial words if boundaries fail, and exclude standalone V which is in BR-V / HR-V
        $name = preg_replace('/\b(?:II|III|IV|VI|VII|VIII)\b/', '', $name);

        // Remove extra spaces that might have been left over or duplicated
        $name = trim(preg_replace('/\s+/', ' ', $name));

        // Apply title case: capitalize the first letter of each word
        $uppercaseLookup = array_flip(self::$uppercaseWords);
        $words = explode(' ', $name);
        $result = [];

        foreach ($words as $word) {
            $upper = strtoupper($word);

            // Preserve known uppercase abbreviations
            if (isset($uppercaseLookup[$upper])) {
                $result[] = $upper;
                continue;
            }

            // Preserve words that contain hyphens (e.g. "CR-V") – title-case each segment
            if (str_contains($word, '-')) {
                $result[] = implode('-', array_map(fn ($part) =>
                    isset($uppercaseLookup[strtoupper($part)])
                        ? strtoupper($part)
                        : ucfirst(strtolower($part)),
                    explode('-', $word)
                ));
                continue;
            }

            // Preserve words that are already in a known mixed-case form
            // (e.g. "i10", "e208" – starts with a lowercase letter followed by digits)
            if (preg_match('/^[a-z]\d/', $word)) {
                // Keep as-is but ensure the letter is lowercase
                $result[] = strtolower($word[0]) . substr($word, 1);
                continue;
            }

            // Default: Title case (first letter upper, rest lower)
            $result[] = ucfirst(strtolower($word));
        }

        return implode(' ', $result);
    }
}
