<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Airport;
use Illuminate\Support\Facades\Http;
use Locale;

class SeedGlobalAirports extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'airports:seed-global';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed the airports table with a comprehensive global dataset of ~9000+ airports to maximize match rates.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Downloading global airports dataset...');

        // IP2Location IATA/ICAO database (Public Domain / Open Source)
        $url = 'https://raw.githubusercontent.com/ip2location/ip2location-iata-icao/master/iata-icao.csv';
        
        $response = Http::timeout(30)->get($url);
        
        if (!$response->successful()) {
            $this->error('Failed to download dataset. Status: ' . $response->status());
            return 1;
        }

        $lines = explode("\n", $response->body());
        if (count($lines) < 10) {
            $this->error('Downloaded file seems empty or invalid.');
            return 1;
        }

        $this->info('Parsing and inserting data (this may take a minute)...');

        $count = 0;
        $bar = $this->output->createProgressBar(count($lines));

        foreach ($lines as $line) {
            $bar->advance();

            // Skip empty lines
            if (empty(trim($line))) continue;

            $data = str_getcsv($line);
            
            // Format: "country_code","region_name","iata","icao","airport","latitude","longitude"
            // Ensure this looks like a valid row by checking count
            if (count($data) < 5 || strtolower(trim($data[0])) === 'country_code') continue;
            
            $countryCode = $data[0];
            $regionName  = $data[1]; // We will use this as city if there's no better data
            $iata        = $data[2];
            $airportName = $data[4];

            // We only want airports with a valid 3-letter IATA code
            if (empty($iata) || strlen($iata) !== 3) continue;

            // Resolve full country name using PHP's intl Locale
            $countryName = class_exists('Locale') && !empty($countryCode) 
                ? Locale::getDisplayRegion('-' . $countryCode, 'en') 
                : $countryCode;
            
            // Cleanup: use region as city. It's not perfect but it's much better than nothing.
            $cityName = trim(str_replace(' Airport', '', $regionName));

            // Overrides for Arabic transliterations from IP2Location dataset
            $cityOverrides = [
                // UAE
                'Dubayy' => 'Dubai',
                'Abu Zaby' => 'Abu Dhabi',
                'Al Fujayrah' => 'Fujairah',
                'Ash Shariqah' => 'Sharjah',
                "Ra's al Khaymah" => 'Ras Al Khaimah',
                // Egypt
                'Al Qahirah' => 'Cairo',
                'Al Iskandariyah' => 'Alexandria',
                'Al Uqsur' => 'Luxor',
                'Al Bahr al Ahmar' => 'Hurghada',
                "Janub Sina'" => 'Sharm El Sheikh',
                'Al Jizah' => 'Giza',
                // Saudi Arabia
                'Ar Riyad' => 'Riyadh',
                'Makkah al Mukarramah' => 'Jeddah',
                'Al Madinah al Munawwarah' => 'Madinah',
                'Ash Sharqiyah' => 'Dammam',
                // Qatar
                'Ad Dawhah' => 'Doha',
                // Bahrain
                'Al Muharraq' => 'Muharraq',
                // Kuwait
                'Al Farwaniyah' => 'Kuwait City',
                // Jordan
                "Al 'Aqabah" => 'Aqaba',
                "Al 'Asimah" => 'Amman',
                'Madaba' => 'Amman',
            ];
            if (isset($cityOverrides[$cityName])) {
                $cityName = $cityOverrides[$cityName];
            }

            Airport::updateOrCreate(
                ['iata_code' => strtoupper(trim($iata))],
                [
                    'country' => $countryName,
                    'city' => $cityName,
                    'airport_name' => trim($airportName),
                ]
            );

            $count++;
        }

        $bar->finish();
        $this->newLine(2);
        
        $this->info("Successfully seeded $count airports into the database!");
        return 0;
    }
}
