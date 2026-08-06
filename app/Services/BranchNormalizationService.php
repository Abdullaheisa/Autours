<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Airport;
use App\Models\Branch;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BranchNormalizationService
{
    /**
     * Cached airports, keyed by iata_code (uppercase).
     *
     * @var array<string, Airport>|null
     */
    private ?array $airportsByIata = null;

    /**
     * Cached airports, keyed by lowercase city name.
     *
     * @var array<string, Airport[]>|null
     */
    private ?array $airportsByCity = null;

    /**
     * Load and cache all airports from the database.
     */
    private function loadAirports(): void
    {
        if ($this->airportsByIata !== null) {
            return;
        }

        $airports = Airport::all();

        $this->airportsByIata = [];
        $this->airportsByCity = [];

        foreach ($airports as $airport) {
            $this->airportsByIata[strtoupper($airport->iata_code)] = $airport;

            $cityKey = strtolower(trim($airport->city));
            $this->airportsByCity[$cityKey][] = $airport;
        }
    }

    /**
     * Try to match a branch to a canonical airport and return normalization data.
     *
     * Returns an array with keys: airport_id, normalized_name, location
     * Only non-null values should be used to update the branch.
     *
     * @param string $name       The branch name from the supplier
     * @param string $city       The city from the supplier
     * @param string $country    The country from the supplier
     * @param string|null $stationId  The station_id (sometimes an IATA code)
     * @param string|null $abriviation The abbreviation field
     * @return array{airport_id: int|null, normalized_name: string|null, location: string}
     */
    public function normalize(
        string $name,
        string $city,
        string $country,
        ?string $stationId = null,
        ?string $abriviation = null
    ): array {
        $this->loadAirports();

        $airport = $this->findMatchingAirport($name, $city, $country, $stationId, $abriviation);

        if ($airport) {
            return [
                'airport_id' => $airport->id,
                'normalized_name' => $airport->airport_name,
                'location' => $airport->city,
                'country' => \App\Services\CountryCurrencyResolver::normalizeCountryName($airport->country),
                'abriviation' => strtoupper($airport->iata_code),
            ];
        }

        // No airport match — normalize the location field to title-case for consistency
        $normalizedLocation = $this->normalizeCityName($city ?: $name);

        return [
            'airport_id' => null,
            'normalized_name' => null,
            'location' => $normalizedLocation,
            'country' => null,
        ];
    }

    /**
     * Try to find a matching airport using multiple strategies.
     */
    private function findMatchingAirport(
        string $name,
        string $city,
        string $country,
        ?string $stationId,
        ?string $abriviation
    ): ?Airport {
        // Strategy 1: Direct exact match on known IATA code
        // We assume abbreviation is an IATA if it's exactly 3 letters
        if ($abriviation && preg_match('/^[A-Z]{3}$/i', $abriviation)) {
            $iata = strtoupper($abriviation);
            if (isset($this->airportsByIata[$iata])) {
                $airport = $this->airportsByIata[$iata];
                if ($this->validateIataMatch($airport, $name, $country)) {
                    return $airport;
                }
            }
        }

        // Strategy 2: Direct match using stationId
        if ($stationId && preg_match('/^[A-Z]{3}$/i', $stationId)) {
            $iata = strtoupper($stationId);
            if (isset($this->airportsByIata[$iata])) {
                $airport = $this->airportsByIata[$iata];
                if ($this->validateIataMatch($airport, $name, $country)) {
                    return $airport;
                }
            }
        } // Strategy 3: Extract IATA code from branch name — patterns like (DXB), (SAW), (ADB)
        $iataFromName = $this->extractIataFromName($name);
        if ($iataFromName && isset($this->airportsByIata[$iataFromName])) {
            return $this->airportsByIata[$iataFromName];
        }

        // Strategy 4: Fuzzy scoring match for airport branches
        if ($this->isAirportBranch($name)) {
            $airport = $this->findFuzzyAirport($name, $city, $country);
            if ($airport) {
                return $airport;
            }
        }

        return null;
    }

    /**
     * Extract a 3-letter IATA code from parentheses in a branch name.
     * Matches patterns like: "(DXB)", "(SAW)", "(ADB)"
     */
    private function extractIataFromName(string $name): ?string
    {
        if (preg_match('/\(([A-Z]{3})\)/i', $name, $matches)) {
            return strtoupper($matches[1]);
        }

        return null;
    }

    /**
     * Validate if an IATA code match makes sense to prevent false positives from 3-letter station IDs.
     */
    private function validateIataMatch(Airport $airport, string $branchName, string $branchCountry): bool
    {
        if ($this->isAirportBranch($branchName)) {
            return true; // Clearly an airport branch
        }
        
        $cleanAirportCountry = $this->cleanString($airport->country);
        $cleanBranchCountry = $this->cleanString($branchCountry);
        
        if (!empty($cleanBranchCountry) && $cleanAirportCountry === $cleanBranchCountry) {
            return true; // Same country, so the 3-letter code is likely legit
        }

        return false;
    }

    /**
     * Check if a branch name suggests it's an airport location.
     */
    private function isAirportBranch(string $name): bool
    {
        $cleanName = $this->cleanString($name);
        return str_contains($cleanName, 'airport') || str_contains($cleanName, 'terminal');
    }

    /**
     * Clean and canonicalize name variations, spelling typos, and special characters.
     */
    private function cleanString(string $str): string
    {
        $str = strtolower($str);

        // Replace common accented or Turkish characters
        $replacements = [
            'ı' => 'i', 'i' => 'i', 'ğ' => 'g', 'ü' => 'u', 'ş' => 's', 'ö' => 'o', 'ç' => 'c',
            'â' => 'a', 'ê' => 'e', 'î' => 'i', 'ô' => 'o', 'û' => 'u',
        ];
        $str = strtr($str, $replacements);

        // Remove non-alphanumeric characters except spaces
        $str = preg_replace('/[^a-z0-9\s]/', ' ', $str);

        // Replace common airport keyword variations/typos
        $wordReplacements = [
            'airbort' => 'airport',
            'arport' => 'airport',
            'airpot' => 'airport',
            'aeroporto' => 'airport',
            'aeroport' => 'airport',
            'flughafen' => 'airport',
            'havalimanı' => 'airport',
            'havalimani' => 'airport',
            'havaliman' => 'airport',
            'apt' => 'airport',
            'international' => 'intl',
            'int' => 'intl',
            'intl' => 'intl',
        ];

        $words = preg_split('/\s+/', $str, -1, PREG_SPLIT_NO_EMPTY);
        $cleanedWords = [];
        foreach ($words as $word) {
            $cleanedWords[] = $wordReplacements[$word] ?? $word;
        }

        return implode(' ', $cleanedWords);
    }

    /**
     * Try to find the best matching airport by scoring all airports in the list.
     */
    private function findFuzzyAirport(string $name, string $city, string $country): ?Airport
    {
        $cleanName = $this->cleanString($name);
        $cleanCity = $this->cleanString($city);
        $cleanCountry = $this->cleanString($country);

        $bestAirport = null;
        $bestScore = 0;

        foreach ($this->airportsByIata as $airport) {
            $airportNameClean = $this->cleanString($airport->airport_name);
            $airportCityClean = $this->cleanString($airport->city);
            $airportCountryClean = $this->cleanString($airport->country);
            $iataClean = strtolower($airport->iata_code);

            $score = 0;

            // 1. Country match
            if ($airportCountryClean === $cleanCountry && !empty($cleanCountry)) {
                $score += 15;
            }

            // 2. City match (direct or substring)
            if (!empty($cleanCity) && !empty($airportCityClean)) {
                if ($cleanCity === $airportCityClean) {
                    $score += 25;
                } elseif (str_contains($cleanCity, $airportCityClean) || str_contains($airportCityClean, $cleanCity)) {
                    $score += 15;
                }
            }

            // 3. Branch name contains airport city
            if (!empty($airportCityClean) && str_contains($cleanName, $airportCityClean)) {
                $score += 20;
            }

            // 4. Standalone IATA match in branch name
            if (preg_match('/\b' . preg_quote($iataClean, '/') . '\b/i', $cleanName)) {
                $score += 150;
            }

            // 5. Core words of airport name present in branch name
            $genericKeywords = [
                'airport', 'apt', 'havalimani', 'havaliman', 'havalimanı', 'terminal',
                'aeroporto', 'aeroport', 'flughafen', 'intl', 'international', 'int',
            ];
            
            $airportWords = preg_split('/\s+/', $airportNameClean, -1, PREG_SPLIT_NO_EMPTY);
            $coreAirportWords = array_filter($airportWords, fn($word) => !in_array($word, $genericKeywords));

            if (!empty($coreAirportWords)) {
                $matchedCoreWordsCount = 0;
                foreach ($coreAirportWords as $coreWord) {
                    if (preg_match('/\b' . preg_quote($coreWord, '/') . '\b/i', $cleanName)) {
                        $matchedCoreWordsCount++;
                    }
                }

                if ($matchedCoreWordsCount === count($coreAirportWords)) {
                    $score += 50;
                } elseif ($matchedCoreWordsCount > 0) {
                    $score += $matchedCoreWordsCount * 15;
                }
            }

            // 6. Perfect match bonus
            if ($cleanName === $airportNameClean) {
                $score += 100;
            }

            if ($score > $bestScore) {
                $bestScore = $score;
                $bestAirport = $airport;
            }
        }

        return $bestScore >= 50 ? $bestAirport : null;
    }

    /**
     * Normalize a city name to consistent title case and standard formatting.
     */
    private function normalizeCityName(string $city): string
    {
        // Remove content in parentheses
        $city = preg_replace('/\s*\([^)]*\)/', '', $city);

        // Trim whitespace
        $city = trim($city);

        // Convert ALL CAPS to title case
        if ($city === strtoupper($city) && strlen($city) > 3) {
            $city = Str::title(strtolower($city));
        }

        // Handle Turkish names — convert İ properly
        $city = str_replace('İ', 'İ', $city); // Already correct
        $city = str_replace('ı', 'ı', $city); // Already correct

        return $city;
    }

    /**
     * Backfill normalization for all existing branches.
     *
     * @return array{total: int, matched: int, unmatched: int, updated: int}
     */
    public function backfillAll(): array
    {
        $this->loadAirports();

        $branches = Branch::all();
        $stats = [
            'total' => $branches->count(),
            'matched' => 0,
            'unmatched' => 0,
            'updated' => 0,
        ];

        foreach ($branches as $branch) {
            $result = $this->normalize(
                $branch->name ?? '',
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );

            if ($result['airport_id'] !== null) {
                $stats['matched']++;
            } else {
                $stats['unmatched']++;
            }

            // Check if anything changed
            $changed = false;
            if ($branch->airport_id !== $result['airport_id']) {
                $changed = true;
            }
            if ($branch->normalized_name !== $result['normalized_name']) {
                $changed = true;
            }
            if ($branch->location !== $result['location']) {
                $changed = true;
            }

            if ($changed) {
                $branch->update([
                    'airport_id' => $result['airport_id'],
                    'normalized_name' => $result['normalized_name'],
                    'location' => $result['location'],
                    'abriviation' => $result['abriviation'] ?? $branch->abriviation,
                ]);
                $stats['updated']++;
            }
        }

        return $stats;
    }
}
