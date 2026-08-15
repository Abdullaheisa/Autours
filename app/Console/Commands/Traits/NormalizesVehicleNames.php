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
