<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\EmrJsonApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use App\Services\BranchNormalizationService;
use Illuminate\Support\Str;

class SyncEmrBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emr:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync EMR/Turev Rent locations as branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        // Suppress PHP 8.5 deprecations from older Guzzle versions
        error_reporting(E_ALL & ~E_DEPRECATED);

        $service = new EmrJsonApiService();

        // ------------------------------------------------------------------
        // 1. Resolve or create the EMR supplier user
        // ------------------------------------------------------------------
        $supplierUser = User::firstOrCreate(
            ['email' => 'alicansarp@emrcarrental.com'],
            [
                'name' => 'Turev Rent (EMR)',
                'role' => 'active_supplier',
                'password' => Hash::make(Str::random(32)),
                'company' => 'Turev Rent',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // ------------------------------------------------------------------
        // 2. Fetch all locations from EMR
        // ------------------------------------------------------------------
        $this->info('Fetching locations from EMR...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->error('No locations returned from EMR API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        // ------------------------------------------------------------------
        // 3. Create/update one branch per location
        // ------------------------------------------------------------------
        $created = 0;
        $updated = 0;

        foreach ($locations as $location) {
            $locationId = (string) ($location['location_id'] ?? '');
            $locationName = (string) ($location['location_name'] ?? '');
            $address = (string) ($location['address'] ?? '');
            $countryCode = (string) ($location['country'] ?? '');
            $mapsPoint = (string) ($location['maps_point'] ?? '');

            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            // Parse lat/lng from Maps_Point if format is "lat, lng"
            $lat = null;
            $lng = null;
            if (str_contains($mapsPoint, ',')) {
                $parts = array_map('trim', explode(',', $mapsPoint, 2));
                $lat = $parts[0] ?? null;
                $lng = $parts[1] ?? null;
            }

            $country = $this->resolveCountryName($countryCode);
            $currency = $this->resolveCurrency($countryCode);

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $locationId,
                ],
                [
                    'name' => $locationName,
                    'location' => $locationName,
                    'adresse' => $address ?: $locationName,
                    'city' => $locationName,
                    'country' => $country,
                    'currency' => $currency,
                    'lat' => $lat,
                    'lng' => $lng,
                    'location_type' => $this->detectLocationType($locationName),
                    'abriviation' => $locationId,
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
        // 4. Delete branches no longer returned by EMR
        // ------------------------------------------------------------------
        $activeLocationIds = array_filter(array_map(
            fn ($l) => (string) ($l['location_id'] ?? ''),
            $locations
        ));

        $orphanedBranches = Branch::where('company_id', $supplierUser->id)
            ->whereNotIn('station_id', $activeLocationIds)
            ->get();

        $deleted = 0;
        foreach ($orphanedBranches as $ob) {
            $ob->delete();
            $deleted++;
            $this->warn("Deleted orphaned branch: {$ob->name}");
        }

        $this->newLine();
        $this->info('========== EMR Branch Sync Complete ==========');
        $this->info("Created  : {$created}");
        $this->info("Updated  : {$updated}");
        $this->info("Deleted  : {$deleted}");
        $this->info("Locations: " . count($locations));
        $this->info('==============================================');

        return self::SUCCESS;
    }

    /**
     * Detect location type from location name.
     */
    private function detectLocationType(string $name): string
    {
        $lower = strtolower($name);

        if (str_contains($lower, 'airport') || str_contains($lower, 'havaliman') || str_contains($lower, 'terminal')) {
            return 'Airport';
        }
        if (str_contains($lower, 'hotel') || str_contains($lower, 'otel')) {
            return 'Hotel';
        }

        return 'Downtown';
    }

    /**
     * Resolve full country name from ISO country code.
     */
    private function resolveCountryName(string $code): string
    {
        return match (strtoupper($code)) {
            'TR' => 'Turkey',
            'ME' => 'Montenegro',
            'AL' => 'Albania',
            'CY' => 'Cyprus',
            'MK' => 'North Macedonia',
            'XK' => 'Kosovo',
            'BA' => 'Bosnia and Herzegovina',
            'HR' => 'Croatia',
            'MA' => 'Morocco',
            default => $code,
        };
    }

    /**
     * Resolve currency from ISO country code.
     */
    private function resolveCurrency(string $code): string
    {
        return match (strtoupper($code)) {
            'TR' => 'TRY',
            default => 'EUR',
        };
    }
}
