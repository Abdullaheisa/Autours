<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\RentlyApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncRentlyBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rently:sync-branches
                            {--countries= : Comma-separated list of countries to sync (e.g. Jordan,Morocco)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Rently Network enabled places as branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Suppress PHP 8.5 deprecations
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new RentlyApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the Rently supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::where('email', 'bookings@streetrentacar.com')->first();
        if (!$supplierUser) {
            $supplierUser = User::create([
                'email' => 'bookings@streetrentacar.com',
                'name' => 'Street Supplier',
                'role' => 'active_supplier',
                'password' => Hash::make('0000'),
                'company' => 'Street Network',
            ]);
        }

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all enabled places from Rently
        // ------------------------------------------------------------------
        $this->info('Fetching enabled places from Rently...');
        $token = $service->getToken();
        if (!$token) {
            $this->error('Failed to obtain Rently token.');
            return self::FAILURE;
        }

        $response = Http::withoutVerifying()
            ->withToken($token)
            ->timeout(60)
            ->get('https://api.rentlynetwork.com/api/Places');

        if (!$response->successful()) {
            $this->error('Failed to fetch places from Rently API. Status: ' . $response->status());
            return self::FAILURE;
        }

        $places = $response->json();

        if ($this->option('countries')) {
            $allowedCountries = array_map('strtolower', array_map('trim', explode(',', $this->option('countries'))));
            $filteredPlaces = [];
            foreach ($places as $place) {
                $rawCountry = strtolower((string) ($place['country'] ?? ''));
                $resolvedCountry = strtolower($this->resolveCountryName($rawCountry));
                
                if (in_array($rawCountry, $allowedCountries) || in_array($resolvedCountry, $allowedCountries)) {
                    $filteredPlaces[] = $place;
                }
            }
            $places = $filteredPlaces;
        }

        $this->info('Places filtered to sync: ' . count($places));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per place
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;

        foreach ($places as $place) {
            $placeId = (string) ($place['id'] ?? '');
            $iataCode = (string) ($place['iata'] ?? '');
            $city = (string) ($place['city'] ?? '');
            $countryCode = (string) ($place['country'] ?? '');
            $address = (string) ($place['address'] ?? '');
            $address2 = (string) ($place['address2'] ?? '');
            
            // Name priority: address2 usually has the descriptive name in Rently
            $locationName = $address2 ?: ($address ?: "{$city} ({$iataCode})");

            if (empty($placeId)) {
                continue;
            }

            $country = $this->resolveCountryName($countryCode);
            $currency = $this->resolveCurrency($countryCode);

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $placeId, // Store integer ID for AvailabilityByPlace
                ],
                [
                    'name' => $locationName,
                    'location' => $locationName,
                    'adresse' => $address ?: $locationName,
                    'city' => $city ?: $locationName,
                    'country' => $country,
                    'currency' => $currency,
                    'location_type' => (string) ($place['type'] ?? 'Downtown'),
                    'abriviation' => $iataCode,
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
        // 4. Delete branches no longer returned by Rently
        // ------------------------------------------------------------------
        $activePlaceIds = array_filter(array_map(
            fn ($p) => (string) ($p['id'] ?? ''),
            $places
        ));

        $orphanedBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotIn('station_id', $activePlaceIds)
            ->get();

        $deleted = 0;
        foreach ($orphanedBranches as $ob) {
            $ob->delete();
            $deleted++;
            $this->warn("Deleted orphaned branch: {$ob->name}");
        }

        $this->newLine();
        $this->info('========== Rently Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Places   : " . count($places));
        $this->info('=================================================');

        return self::SUCCESS;
    }

    private function resolveCountryName(string $code): string
    {
        return match (strtoupper($code)) {
            'US' => 'United States',
            'GB' => 'United Kingdom',
            'TR' => 'Turkey',
            'ES' => 'Spain',
            'FR' => 'France',
            'IT' => 'Italy',
            'DE' => 'Germany',
            'AE' => 'United Arab Emirates',
            'AR' => 'Argentina',
            'CO' => 'Colombia',
            'GR' => 'Greece',
            'UY' => 'Uruguay',
            'MX' => 'Mexico',
            'JO' => 'Jordan',
            'MA' => 'Morocco',
            default => $code,
        };
    }

    private function resolveCurrency(string $code): string
    {
        return match (strtoupper($code)) {
            'AE' => 'AED',
            'US' => 'USD',
            'TR' => 'TRY',
            'GB' => 'GBP',
            'AR' => 'ARS',
            'UY' => 'UYU',
            'MX' => 'MXN',
            'CO' => 'COP',
            'JO' => 'JOD',
            'MA' => 'MAD',
            default => 'EUR',
        };
    }
}
