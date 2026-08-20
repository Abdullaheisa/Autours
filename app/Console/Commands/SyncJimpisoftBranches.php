<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\CountryCurrencyResolver;
use App\Services\JimpisoftApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncJimpisoftBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jimpisoft:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Jimpisoft/Rentway stations as individual branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $service = new JimpisoftApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Jimpisoft supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'Jincy@drivus.ae'],
            [
                'name' => 'Drivus',
                'role' => 'active_supplier',
                'password' => Hash::make(Str::random(32)),
                'company' => 'Drivus',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all stations from Jimpisoft
        // ------------------------------------------------------------------
        $this->info('Fetching stations from Jimpisoft...');
        $stations = $service->getStations();

        if (empty($stations)) {
            $this->error('No stations returned from Jimpisoft API.');
            return self::FAILURE;
        }

        $this->info('Stations fetched: ' . count($stations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per station
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;

        foreach ($stations as $station) {
            $stationId = (string) ($station['StationID'] ?? $station['stationID'] ?? '');
            
            // Consolidate Dubai Airport terminals into one branch (DXB1)
            // Also skip Jimpisoft's original 'DXB' (Dubai Htl City Limit) to prevent clash
            if (in_array($stationId, ['DXB2', 'DXB3', 'DXB'])) {
                continue; // Skip these completely
            }
            
            $stationName = (string) ($station['Station'] ?? $station['station'] ?? '');
            
            if ($stationId === 'DXB1') {
                $stationId = 'DXB'; // Map it to DXB like other suppliers
                $stationName = 'Dubai International Airport (DXB), UAE';
            }
            
            $city = (string) ($station['City'] ?? $station['city'] ?? '');
            $latitude = (string) ($station['Latitude'] ?? $station['latitude'] ?? '');
            $longitude = (string) ($station['Longitude'] ?? $station['longitude'] ?? '');
            $currency = (string) ($station['currency'] ?? '');

            if (empty($stationId) || empty($stationName)) {
                continue;
            }

            $country = $this->detectCountry($stationName, $city);

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $stationId,
                ],
                [
                    'name' => $stationName,
                    'location' => $city,
                    'adresse' => $stationName,
                    'city' => $city,
                    'country' => $country,
                    'currency' => $currency ?: CountryCurrencyResolver::resolveCurrencyByCountryName($country),
                    'lat' => $latitude,
                    'lng' => $longitude,
                    'location_type' => $this->detectLocationType($stationName),
                    'abriviation' => $stationId,
                ]
            );

            // Normalize branch name/location against canonical airports
            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city,
                $branch->country,
                $branch->station_id,
                $branch->abriviation
            );
            $branch->update($normData);

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        // ------------------------------------------------------------------
        // 4. Delete branches no longer returned by Jimpisoft (and excluded ones)
        // ------------------------------------------------------------------
        $activeStationIds = array_filter(array_map(
            function ($s) {
                $id = (string) ($s['StationID'] ?? $s['stationID'] ?? '');
                // Treat DXB2, DXB3, and original DXB as inactive 
                if (in_array($id, ['DXB2', 'DXB3', 'DXB'])) {
                    return '';
                }
                if ($id === 'DXB1') {
                    return 'DXB'; // We saved it as DXB in the database
                }
                return $id;
            },
            $stations
        ));

        $orphanedBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotIn('station_id', $activeStationIds)
            ->get();

        $deleted = 0;
        foreach ($orphanedBranches as $ob) {
            $ob->delete();
            $deleted++;
            $this->warn("Deleted orphaned branch: {$ob->name}");
        }

        $this->newLine();
        $this->info('========== Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Stations : " . count($stations));
        $this->info('==========================================');

        return self::SUCCESS;
    }

    /**
     * Detect location type from station name.
     */
    private function detectLocationType(string $name): string
    {
        if (stripos($name, 'Airport') !== false || stripos($name, 'Terminal') !== false) {
            return 'Airport';
        }
        if (stripos($name, 'Hotel') !== false) {
            return 'Hotel';
        }
        return 'Downtown';
    }

    /**
     * Detect country from station name or city.
     * Station names often contain the country after a comma, e.g. "Antalya Airport, Turkey".
     */
    private function detectCountry(string $stationName, string $city): string
    {
        // 1. Try to extract from comma-separated suffix (e.g., "Vienna Airport, Austria")
        if (strpos($stationName, ',') !== false) {
            $parts = explode(',', $stationName);
            $possibleCountry = trim(end($parts));
            if (!empty($possibleCountry) && strlen($possibleCountry) > 2) {
                if (strtolower($possibleCountry) === 'uae') {
                    return 'United Arab Emirates';
                }
                if (strtolower($possibleCountry) === 'uk') {
                    return 'United Kingdom';
                }
                if (strtolower($possibleCountry) === 'us' || strtolower($possibleCountry) === 'usa') {
                    return 'United States';
                }
                return ucwords(strtolower($possibleCountry));
            }
        }

        // 2. Fallback to keyword matching
        $haystack = strtolower($stationName . ' ' . $city);

        $countryKeywords = [
            'Turkey' => ['turkey', 'antalya', 'istanbul', 'izmir', 'bodrum', 'dalaman', 'mugla'],
            'Cyprus' => ['cyprus', 'larnaca', 'limassol', 'paphos', 'nicosia', 'ayia napa', 'protaras'],
            'Greece' => ['greece', 'athens', 'thessaloniki', 'crete', 'heraklion', 'rhodes'],
            'Oman' => ['oman', 'muscat', 'salalah', 'sohar'],
            'Bahrain' => ['bahrain', 'manama', 'sanad', 'sanabis', 'riffa', 'salmabad'],
            'Saudi Arabia' => ['saudi', 'riyadh', 'jeddah', 'dammam'],
            'Qatar' => ['qatar', 'doha'],
            'Kuwait' => ['kuwait'],
            'Morocco' => ['morocco', 'marrakesh', 'marrakech', 'tangier', 'rabat', 'casablanca'],
            'Malta' => ['malta', 'valletta', 'xemxija', 'sleima'],
            'Albania' => ['albania', 'vlora', 'tirana', 'shkodra', 'durres'],
            'Austria' => ['austria', 'vienna', 'salzburg', 'bratislavaairport'],
            'Seychelles' => ['seychelles', 'victoria', 'mahe', 'la louise'],
            'Bulgaria' => ['bulgaria', 'sofia', 'plovdiv'],
            'United Kingdom' => ['london', 'gatwick', 'stansted', 'heathrow', 'luton'],
            'United States' => ['florida', 'orlando', 'miami', 'tampa', 'fll'],
            'New Zealand' => ['newze', 'queenstown', 'new zealand'],
        ];

        foreach ($countryKeywords as $country => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($haystack, $keyword)) {
                    return $country;
                }
            }
        }

        return 'United Arab Emirates';
    }
}
