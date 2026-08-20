<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Branch;

class NormalizeAirports extends Command
{
    protected $signature = 'airports:normalize';
    protected $description = 'Normalize airport names and IATA codes from CSV';

    public function handle()
    {
        $csvPath = base_path('Autours_Airports_List.csv');
        if (!file_exists($csvPath)) {
            $this->error('CSV file not found at ' . $csvPath);
            return 1;
        }

        $csvData = array_map('str_getcsv', file($csvPath));
        array_shift($csvData);

        $airports = [];
        foreach ($csvData as $row) {
            if (count($row) >= 5) {
                $airports[] = [
                    'country' => trim($row[1]),
                    'airport_name' => trim($row[2]),
                    'city' => trim($row[3]),
                    'iata' => trim($row[4]),
                ];
            }
        }

        $branches = Branch::where('location_type', 'like', '%Airport%')
            ->orWhere('name', 'like', '%Airport%')
            ->get();

        $updatedCount = 0;

        foreach ($branches as $branch) {
            $matched = false;
            $bestMatch = null;
            $branchName = strtolower($branch->name);
            
            // First, check for exact IATA code match (whole word) e.g. (DXB) or - DXB or DXB
            foreach ($airports as $airport) {
                $iata = strtolower($airport['iata']);
                if (preg_match("/\b{$iata}\b/i", $branchName)) {
                    $bestMatch = $airport;
                    break;
                }
            }

            if (!$bestMatch) {
                // If no IATA match, check by city and then by name keywords
                foreach ($airports as $airport) {
                    $city = strtolower($airport['city']);
                    $coreCsvName = trim(str_replace(['international', 'airport', ' '], ['', '', ''], strtolower($airport['airport_name'])));
                    $coreBranchName = trim(str_replace(['international', 'airport', ' '], ['', '', ''], $branchName));
                    
                    if ($coreCsvName && strpos($coreBranchName, $coreCsvName) !== false) {
                        $bestMatch = $airport;
                        break;
                    }
                    
                    if (strtolower($branch->city) === $city) {
                        // Distinguish Dubai airports by keywords
                        if ($city === 'dubai') {
                            if (strpos($branchName, 'maktoum') !== false && $airport['iata'] === 'DWC') {
                                $bestMatch = $airport;
                                break;
                            } elseif (strpos($branchName, 'maktoum') === false && $airport['iata'] === 'DXB') {
                                $bestMatch = $airport;
                                break;
                            }
                        } elseif ($city === 'istanbul') {
                            if ((strpos($branchName, 'sabiha') !== false || strpos($branchName, 'saw') !== false) && $airport['iata'] === 'SAW') {
                                $bestMatch = $airport;
                                break;
                            } elseif (strpos($branchName, 'sabiha') === false && strpos($branchName, 'saw') === false && $airport['iata'] === 'IST') {
                                $bestMatch = $airport;
                                break;
                            }
                        } elseif (strpos($branchName, $city) !== false) {
                            $bestMatch = $airport;
                            // don't break, might find a better one
                        }
                    }
                }
            }
            
            // Hardcode fix for some edge cases like "King Hussein Bridge" which is not an airport but got matched
            if (strpos($branchName, 'bridge') !== false) {
                $bestMatch = null;
            }

            // Un-match things that clearly don't belong (Warsaw, Krakow, Heraklion, Pristina, Tanger)
            // if the original db didn't have IATA, we'll clear it.
            $invalidCities = ['warsaw', 'krakow', 'heraklion', 'pristina', 'tanger'];
            foreach ($invalidCities as $invalid) {
                if (strpos($branchName, $invalid) !== false) {
                    $bestMatch = null;
                }
            }

            if ($bestMatch) {
                $branch->abriviation = $bestMatch['iata'];
                $branch->normalized_name = $bestMatch['airport_name'];
                
                if ($branch->isDirty()) {
                    $branch->save();
                    $updatedCount++;
                    $this->info("Updated {$branch->name} -> IATA: {$bestMatch['iata']}, Normalized: {$bestMatch['airport_name']}");
                }
            } else {
                // If it was wrongly matched previously, we can clear it
                // We'll clear it only if it's one of the mistakes
                $wrongIatas = ['SAW', 'RAK', 'IST'];
                foreach ($invalidCities as $invalid) {
                    if (strpos($branchName, $invalid) !== false) {
                        if (in_array($branch->abriviation, $wrongIatas)) {
                            $branch->abriviation = null;
                            $branch->normalized_name = null;
                            $branch->save();
                            $this->info("Reverted {$branch->name}");
                        }
                    }
                }
            }
        }

        $this->info("Successfully updated/reverted branches.");
        return 0;
    }
}
