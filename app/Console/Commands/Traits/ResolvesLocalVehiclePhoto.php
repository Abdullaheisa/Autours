<?php

namespace App\Console\Commands\Traits;

use App\Models\VehiclesPhotos;

trait ResolvesLocalVehiclePhoto
{
    /**
     * Clean and simplify a vehicle name for robust photo matching across misspellings,
     * unicode characters, and hyphen/space differences.
     */
    protected function simplifyForPhotoMatch(?string $name): string
    {
        if (empty($name)) {
            return '';
        }

        $name = mb_strtolower(trim($name));

        // Normalize Turkish / dotted capital and lowercase letters
        $name = str_replace(['i̇', 'ı', 'š', 'ž', 'ć', 'č'], ['i', 'i', 's', 'z', 'c', 'c'], $name);

        // Fix common misspellings or model synonyms with flexible spacing/hyphens
        $name = preg_replace('/\bx\s*-?\s*terr+a\b/', 'xterra', $name);
        $name = preg_replace('/\bx\s*-?\s*trail\b/', 'x trail', $name);
        $name = preg_replace('/\bmicro\b/', 'micra', $name);
        $name = preg_replace('/\brenaut\b/', 'renault', $name);
        $name = preg_replace('/\btleberzer\b/', 'trailblazer', $name);
        $name = preg_replace('/\b(cla|c|e|s|v|gla|glc|gle|gls|glb|a|b|ml)\s*-?\s*class\b/', '$1', $name);
        $name = preg_replace('/\bc\s*-?\s*elysee\b/', 'c elysee', $name);

        // Normalize MG model names like "MG Mg5" or "Mg5" -> "mg 5", "mg 3" -> "mg 3"
        $name = preg_replace('/\bmg\s*mg?(\d+)\b/', 'mg $1', $name);
        if (preg_match('/^mg(\d+)/', $name, $matches)) {
            $name = preg_replace('/^mg(\d+)/', 'mg $1', $name);
        }

        // Normalize models with hyphens vs spaces like "CX-30" vs "CX 30" -> "cx 30"
        $name = preg_replace('/\bcx\s*-?\s*(\d+)\b/', 'cx $1', $name);

        // Remove Roman numerals indicating generation (e.g. II, III, IV, VI) unless part of word
        $name = preg_replace('/\b(?:ii|iii|iv|vi|vii|viii)\b/', '', $name);

        // Remove "or similar", "suv", "choice of supplier" noise
        $name = preg_replace('/\s*\(?or similar\)?/', '', $name);

        // Standardize transmission words
        $name = preg_replace('/\b(?:aut|auto|automatic|automat)\b/', 'automatic', $name);
        $name = preg_replace('/\b(?:man|manual|mt)\b/', 'manual', $name);

        // Strip punctuation (hyphens, slashes, parens, dots) so "Volkswagen -Up" -> "volkswagen up"
        $name = preg_replace('/[^a-z0-9\s]/', ' ', $name);

        // Collapse whitespace
        return trim(preg_replace('/\s+/', ' ', $name));
    }

    /**
     * Find and return local vehicle photo based on name matching
     */
    protected function resolveLocalPhoto(?string $vehicleName): ?string
    {
        if (empty($vehicleName)) {
            return null;
        }

        $vehicleName = trim($vehicleName);
        $lowerName = mb_strtolower($vehicleName);

        // 1. Try exact match first (case-insensitive)
        $photo = VehiclesPhotos::query()
            ->whereRaw('LOWER(name) like ?', ['%' . $lowerName . '%'])
            ->first();

        // 2. If no exact match, try matching just the car model (first two words, case-insensitive)
        if ($photo === null) {
            $nameParts = explode(' ', $vehicleName);
            if (count($nameParts) >= 2) {
                $shortName = mb_strtolower($nameParts[0] . ' ' . $nameParts[1]);
                $photo = VehiclesPhotos::query()
                    ->whereRaw('LOWER(name) like ?', ['%' . $shortName . '%'])
                    ->first();
            }
        }

        // 3. If still no match, check if the database name substring matches inside the vehicle name (reverse check)
        if ($photo === null) {
            $photo = VehiclesPhotos::query()
                ->whereRaw('? LIKE CONCAT(\'%\', LOWER(name), \'%\')', [$lowerName])
                ->whereRaw('LENGTH(name) >= 4') // prevent very short generic names from false matching
                ->first();
        }

        if ($photo !== null) {
            return $photo->photo;
        }

        // 4. Smart Normalized & Simplified Matching across candidates (for hyphens, unicode, spaces, misspellings)
        $targetClean = $this->simplifyForPhotoMatch($vehicleName);
        if (strlen($targetClean) >= 3) {
            $targetModelOnly = trim(preg_replace('/\b(?:automatic|manual|hybrid|electric|diesel)\b/', '', $targetClean));
            $targetWords = explode(' ', $targetModelOnly);
            $targetFirstTwo = count($targetWords) >= 2 ? ($targetWords[0] . ' ' . $targetWords[1]) : $targetModelOnly;

            // Load all candidates (fast ~1,100 rows in PHP memory)
            $allPhotos = VehiclesPhotos::all();
            $bestMatch = null;
            $bestScore = -1;

            foreach ($allPhotos as $candidate) {
                $candidateClean = $this->simplifyForPhotoMatch($candidate->name);
                if (empty($candidateClean)) {
                    continue;
                }

                $candidateModelOnly = trim(preg_replace('/\b(?:automatic|manual|hybrid|electric|diesel)\b/', '', $candidateClean));
                $candidateWords = explode(' ', $candidateModelOnly);
                $candidateFirstTwo = count($candidateWords) >= 2 ? ($candidateWords[0] . ' ' . $candidateWords[1]) : $candidateModelOnly;

                // Check exact cleaned match (`volkswagen up automatic` == `volkswagen up automatic`)
                if ($candidateClean === $targetClean) {
                    return $candidate->photo;
                }

                // Check model exact match (`volkswagen up` == `volkswagen up` OR `mercedes cla` == `mercedes cla`)
                if ($candidateModelOnly !== '' && $candidateModelOnly === $targetModelOnly) {
                    $targetHasAuto = str_contains($targetClean, 'automatic');
                    $targetHasManual = str_contains($targetClean, 'manual');
                    $candHasAuto = str_contains($candidateClean, 'automatic');
                    $candHasManual = str_contains($candidateClean, 'manual');

                    if (($targetHasAuto && $candHasAuto) || ($targetHasManual && $candHasManual)) {
                        return $candidate->photo;
                    }

                    if (!$candHasAuto && !$candHasManual) {
                        $bestMatch = $candidate->photo;
                        $bestScore = 10;
                    } elseif ($bestScore < 5) {
                        $bestMatch = $candidate->photo;
                        $bestScore = 5;
                    }
                }

                // Check first two words (`make model` e.g. `mazda cx 30` == `mazda cx 30`)
                if ($candidateFirstTwo !== '' && strlen($candidateFirstTwo) >= 4 && $candidateFirstTwo === $targetFirstTwo) {
                    $targetHasAuto = str_contains($targetClean, 'automatic');
                    $targetHasManual = str_contains($targetClean, 'manual');
                    $candHasAuto = str_contains($candidateClean, 'automatic');
                    $candHasManual = str_contains($candidateClean, 'manual');

                    if (($targetHasAuto && $candHasAuto) || ($targetHasManual && $candHasManual)) {
                        if ($bestScore < 8) {
                            $bestMatch = $candidate->photo;
                            $bestScore = 8;
                        }
                    } elseif (!$candHasAuto && !$candHasManual) {
                        if ($bestScore < 6) {
                            $bestMatch = $candidate->photo;
                            $bestScore = 6;
                        }
                    } elseif ($bestScore < 3) {
                        $bestMatch = $candidate->photo;
                        $bestScore = 3;
                    }
                }

                // Check mutual containment for longer names (e.g. candidate Model is inside target Model, or target Model inside candidate Model)
                if (strlen($candidateModelOnly) >= 5 && strlen($targetModelOnly) >= 5) {
                    if (str_contains($targetModelOnly, $candidateModelOnly) || str_contains($candidateModelOnly, $targetModelOnly)) {
                        $targetHasAuto = str_contains($targetClean, 'automatic');
                        $targetHasManual = str_contains($targetClean, 'manual');
                        $candHasAuto = str_contains($candidateClean, 'automatic');
                        $candHasManual = str_contains($candidateClean, 'manual');

                        if (($targetHasAuto && $candHasAuto) || ($targetHasManual && $candHasManual)) {
                            if ($bestScore < 7) {
                                $bestMatch = $candidate->photo;
                                $bestScore = 7;
                            }
                        } elseif ($bestScore < 2) {
                            $bestMatch = $candidate->photo;
                            $bestScore = 2;
                        }
                    }
                }
            }

            if ($bestMatch !== null) {
                return $bestMatch;
            }
        }

        return null;
    }
}
