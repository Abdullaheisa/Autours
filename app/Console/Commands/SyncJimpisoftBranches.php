<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
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
            $stationName = (string) ($station['Station'] ?? $station['station'] ?? '');
            $city = (string) ($station['City'] ?? $station['city'] ?? '');
            $latitude = (string) ($station['Latitude'] ?? $station['latitude'] ?? '');
            $longitude = (string) ($station['Longitude'] ?? $station['longitude'] ?? '');

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
                    'currency' => $this->detectCurrency($country),
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
        // 4. Delete branches no longer returned by Jimpisoft
        // ------------------------------------------------------------------
        $activeStationIds = array_filter(array_map(
            fn ($s) => (string) ($s['StationID'] ?? $s['stationID'] ?? ''),
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
        $haystack = strtolower($stationName . ' ' . $city);

        $countryKeywords = [
            'Turkey' => ['turkey', 'antalya', 'istanbul', 'izmir', 'bodrum', 'dalaman', 'mugla'],
            'Cyprus' => ['cyprus', 'larnaca', 'limassol', 'paphos', 'nicosia', 'ayia napa', 'protaras'],
            'Greece' => ['greece', 'athens', 'thessaloniki', 'crete', 'heraklion', 'rhodes'],
            'Oman' => ['oman', 'muscat', 'salalah'],
            'Bahrain' => ['bahrain', 'manama'],
            'Saudi Arabia' => ['saudi', 'riyadh', 'jeddah', 'dammam'],
            'Qatar' => ['qatar', 'doha'],
            'Kuwait' => ['kuwait'],
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

    /**
     * Detect currency from country name.
     */
    private function detectCurrency(string $country): string
    {
        return match ($country) {
            'Turkey' => 'TRY',
            'Cyprus' => 'EUR',
            'Greece' => 'EUR',
            'Oman' => 'OMR',
            'Bahrain' => 'BHD',
            'Saudi Arabia' => 'SAR',
            'Qatar' => 'QAR',
            'Kuwait' => 'KWD',
            default => 'AED',
        };
    }
}
