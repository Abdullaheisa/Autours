<?php

namespace Database\Seeders;

use App\Models\Airport;
use Illuminate\Database\Seeder;

class AirportsSeeder extends Seeder
{
    /**
     * Seed the airports table from the Autours_Airports_List CSV.
     * Idempotent — safe to re-run (uses upsert on iata_code).
     */
    public function run(): void
    {
        $csvPath = base_path('Autours_Airports_List.csv');

        if (! file_exists($csvPath)) {
            $this->command->error("CSV file not found: {$csvPath}");
            return;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Could not open CSV file: {$csvPath}");
            return;
        }

        // Skip the header row
        $header = fgetcsv($handle);

        $count = 0;

        while (($row = fgetcsv($handle)) !== false) {
            // CSV columns: index, Country, Airport Name, City, IATA Code
            if (count($row) < 5) {
                continue;
            }

            $country = trim($row[1]);
            $airportName = trim($row[2]);
            $city = trim($row[3]);
            $iataCode = strtoupper(trim($row[4]));

            if (empty($iataCode) || empty($airportName)) {
                continue;
            }

            Airport::updateOrCreate(
                ['iata_code' => $iataCode],
                [
                    'country' => $country,
                    'airport_name' => $airportName,
                    'city' => $city,
                ]
            );

            $count++;
        }

        fclose($handle);

        $this->command->info("Seeded {$count} airports from CSV.");
    }
}
