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
        'CRV', 'HRV', 'BRV', 'WRX', 'STI', 'RAV', 'CR-V', 'HR-V', 'C-HR', 'BR-V',
        'ZS', 'RX', 'ASX', 'XV', 'NV', 'CX', 'RVR',
    ];

    /**
     * Known automotive brands to detect concatenated multi-vehicle names.
     */
    private static array $knownBrands = [
        'Abarth', 'Alfa Romeo', 'Aston Martin', 'Audi', 'BMW', 'BYD', 'Bentley', 'Cadillac', 'Chery', 'Chevrolet',
        'Chrysler', 'Citroen', 'Cupra', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS', 'Ferrari', 'Fiat',
        'Ford', 'GAC', 'Geely', 'Genesis', 'GMC', 'Great Wall', 'Haval', 'Honda', 'Hummer', 'Hyundai',
        'Infiniti', 'Isuzu', 'Iveco', 'JAC', 'Jaguar', 'Jeep', 'Jetour', 'Kia', 'Lada', 'Lamborghini',
        'Lancia', 'Land Rover', 'Lexus', 'Lincoln', 'Lynk & Co', 'Maserati', 'Maxus', 'Mazda', 'McLaren',
        'Mercedes-Benz', 'Mercedes', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Polestar',
        'Porsche', 'Proton', 'RAM', 'Range Rover', 'Renault', 'Rolls-Royce', 'Rover', 'Saab', 'Seat',
        'Skoda', 'Smart', 'SsangYong', 'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Vauxhall', 'Volkswagen', 'Volvo', 'VW'
    ];

    /**
     * Clean raw vehicle strings that bundle multiple vehicle models (e.g. from Green Motion, U-Save),
     * extract only the first vehicle name, and strip trailing metadata and noise phrases.
     */
    public function cleanMultiVehicleName(string $name): string
    {
        $raw = trim($name);

        // Remove [GM-ID:xxx] or [US-ID:xxx] or similar ID tags
        $raw = preg_replace('/^\[[A-Z0-9_-]+:\d+\]\s*/i', '', $raw);

        // 1. Remove trailing noise phrases: "or similar model", "or similar", "make and model guaranteed", etc.
        $clean = preg_replace('/\s*\(?\b(?:or\s+simil[ai]r(?:\s+model)?|simil[ai]r\s+model|simil[ai]r)\b\)?/i', '', $raw);
        $clean = preg_replace('/\s*\b(?:make\s+and\s+model\s+guaranteed|guaranteed\s+\d{4}(?:\/\d{2})?(?:\s+registered\s+car)?|registered\s+car(?:\s+model)?)\b.*/i', '', $clean);
        $clean = preg_replace('/\s*\b(?:free\s+gps|congestion\s+charge\s+exempt|electric\s+vehicle\s+make\s*&\s*model\s+guaranteed)\b.*/i', '', $clean);
        $clean = trim($clean);

        // 2. Handle slash "/" (e.g. "Hyundai Accent/ Geely Emgrand", but NOT "A/C")
        if (preg_match('/(?<!A)\/(?!C\b)/i', $clean)) {
            $parts = preg_split('/(?<!A)\/(?!C\b)/i', $clean);
            $clean = trim($parts[0]);
        }

        // 3. Normalize hyphens between cars: e.g. "Picanto-Hyundai" where a known brand follows a hyphen
        $brandsRegex = implode('|', self::$knownBrands);
        $clean = preg_replace('/\s*-\s*(' . $brandsRegex . ')\b/i', ' - $1', $clean);

        // 4. Handle " - " (space hyphen space)
        if (preg_match('/\s+-\s+/', $clean)) {
            $parts = preg_split('/\s+-\s+/', $clean);
            $firstPart = trim($parts[0]);
            // Special case: "MG - MG5" where the brand alone is before the hyphen
            if (strcasecmp($firstPart, 'MG') === 0 && isset($parts[1])) {
                $clean = 'MG ' . trim($parts[1]);
            } else {
                $clean = $firstPart;
            }
        }

        // 5. Handle comma "," (e.g. "Audi Q3, BMW X1 Automatic", "Toyota Hilux, Isuzu Dmax")
        if (str_contains($clean, ',')) {
            $parts = explode(',', $clean);
            $clean = trim($parts[0]);
        }

        // 6. Handle " or " if followed by a car name/brand (not "or similar")
        if (preg_match('/\s+or\s+(?!similar\b)/i', $clean)) {
            $parts = preg_split('/\s+or\s+(?!similar\b)/i', $clean);
            $clean = trim($parts[0]);
        }

        // 7. Check if multiple known car brands appear in the remaining string
        // E.g. "Nissan Sentra Hyundai Elantra", "Kia Picanto Mitsubishi Mirage", "Volvo XC90 BMW X5 Mercedes GLE"
        $brandMatches = [];
        foreach (self::$knownBrands as $brand) {
            if (preg_match('/\b' . preg_quote($brand, '/') . '\b/i', $clean, $m, PREG_OFFSET_CAPTURE)) {
                $brandMatches[] = ['brand' => $brand, 'offset' => $m[0][1]];
            }
        }
        if (count($brandMatches) > 1) {
            usort($brandMatches, fn($a, $b) => $a['offset'] <=> $b['offset']);
            $uniqueBrands = [];
            foreach ($brandMatches as $bm) {
                $overlap = false;
                foreach ($uniqueBrands as $ub) {
                    if (abs($ub['offset'] - $bm['offset']) < strlen($ub['brand'])) {
                        $overlap = true;
                        break;
                    }
                }
                if (!$overlap) {
                    $uniqueBrands[] = $bm;
                }
            }
            if (count($uniqueBrands) > 1) {
                $secondBrandOffset = $uniqueBrands[1]['offset'];
                if ($secondBrandOffset > 2) {
                    $clean = trim(substr($clean, 0, $secondBrandOffset));
                }
            }
        }

        // 8. Check for BYD Sealion if preceded by Seal
        if (preg_match('/\b(BYD\s+Seal(?:\s+Saloon)?)\s+Sealion\b/i', $clean, $m)) {
            $clean = $m[1];
        }

        // 9. Remove door descriptors (e.g. "4-5 door", "2-3 doors", "3 doors", "5 doors")
        $clean = preg_replace('/\b\d+(?:\s*[-–\/]\s*\d+)?\s*doors?\b/iu', '', $clean);

        // 10. Remove trailing standalone "model"
        $clean = preg_replace('/\bmodel\b/i', '', $clean);

        return trim($clean, " -,/");
    }

    /**
     * Extract only the first vehicle name and append transmission if specified.
     */
    public function extractFirstVehicleName(string $name, ?string $transmission = null): string
    {
        $cleaned = $this->cleanMultiVehicleName($name);
        $normalized = $this->normalizeVehicleName($cleaned);

        if ($transmission && stripos($normalized, 'Automatic') === false && stripos($normalized, 'Manual') === false) {
            $t = str_contains(strtolower($transmission), 'auto') ? 'Automatic' : 'Manual';
            $normalized .= ' ' . $t;
        }

        return $normalized;
    }

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

        // Clean any bundled multi-vehicle names or noise suffixes first
        $name = $this->cleanMultiVehicleName($name);

        // Replace special characters / Turkish / Unicode letters (e.g. Škoda -> Skoda, İ10 -> I10)
        $name = str_replace(['Š', 'š', 'İ', 'ı', 'ž', 'ć', 'č'], ['S', 's', 'I', 'i', 'z', 'c', 'c'], $name);

        // Fix common brand/model misspellings and synonyms
        $name = preg_replace('/\bRenaut\b/i', 'Renault', $name);
        $name = preg_replace('/\bx\s*-?\s*terr+a\b/i', 'Xterra', $name);
        $name = preg_replace('/\bx\s*-?\s*trail\b/i', 'X-Trail', $name);
        $name = preg_replace('/\bmicro\b/i', 'Micra', $name);
        $name = preg_replace('/\btleberzer\b/i', 'Trailblazer', $name);
        $name = preg_replace('/\bKikcs\b/i', 'Kicks', $name);

        // Normalize Toyota RAV4 to Toyota RAV 4
        $name = preg_replace('/\bRAV4\b/i', 'RAV 4', $name);

        // Normalize Toyota 4runner to Toyota 4 Runner
        $name = preg_replace('/\b4runner\b/i', '4 Runner', $name);

        // Normalize MG model names like "MG Mg5" or "Mg5" -> "MG 5", "MG Mg3" -> "MG 3"
        $name = preg_replace('/\bMG\s*Mg?(\d+)\b/i', 'MG $1', $name);
        $name = preg_replace('/^Mg(\d+)/i', 'MG $1', $name);

        // Clean up stray hyphens or extra spaces around hyphens in names (e.g. "C- Elysee" -> "C-Elysee", " - Up" -> " Up", " -Up" -> " Up")
        $name = preg_replace('/\b([a-zA-Z]+)\s+-\s*([a-zA-Z]+)\b/', '$1-$2', $name);
        $name = preg_replace('/\b([a-zA-Z]+)\s*-\s+([a-zA-Z]+)\b/', '$1-$2', $name);
        $name = preg_replace('/\s+-\s*([a-zA-Z0-9]+)\b/', ' $1', $name);
        $name = preg_replace('/\s+-\b/', ' ', $name);

        // Normalize transmission types often appended to car names
        // Matches whole words like AUT, AUTO, AUTOMATIC, AUTOMATiC (case-insensitive)
        $name = preg_replace('/\b(?:AUT|AUTO|AUTOMATIC)\b/i', 'Automatic', $name);
        
        // Matches whole words like MANUAL (case-insensitive), but NOT the standalone "MAN" word
        // to avoid matching brand names like "MAN" trucks
        $name = preg_replace('/\bMANUAL\b/i', 'Manual', $name);

        // Remove Roman numerals indicating generation (e.g. II, III, IV, VI)
        // Only uppercase to avoid matching partial words if boundaries fail, and exclude standalone V which is in BR-V / HR-V
        $name = preg_replace('/\b(?:II|III|IV|VI|VII|VIII)\b/', '', $name);

        // Remove the word "SUV" from the name
        $name = preg_replace('/\bSUV\b/i', '', $name);

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
