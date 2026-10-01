<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncZagelBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zagel:sync-branches {--dry-run : Only fetch from API and print what would be done}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync Zagel Express locations as branches.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $supplierUserId = 170; // Zagel Express user ID
        $this->info("Using Zagel Express supplier user ID: {$supplierUserId}");

        $this->info('Fetching locations from Zagel Express API...');
        
        $response = Http::withoutVerifying()->get('https://zagelexpress.net/api/v1/locations');

        if (!$response->successful()) {
            $this->error('Failed to fetch locations. HTTP ' . $response->status());
            return self::FAILURE;
        }

        $data = $response->json();
        $locations = $data['data'] ?? [];

        if (empty($locations)) {
            $this->error('No locations returned from Zagel API.');
            return self::FAILURE;
        }

        $this->info('Locations fetched: ' . count($locations));

        $created = 0;
        $updated = 0;

        foreach ($locations as $location) {
            $locationId = (string) ($location['id'] ?? '');
            $locationName = (string) ($location['name'] ?? '');
            $address = (string) ($location['address'] ?? '');
            
            if (empty($locationId) || empty($locationName)) {
                continue;
            }

            if ($this->option('dry-run')) {
                $this->line("[DRY RUN] Would sync location ID {$locationId} -> '{$locationName}'");
                continue;
            }

            $isAirport = str_contains(strtolower($locationName), 'مطار');
            $airportId = null;
            $abriviation = $locationId;
            $city = 'Muscat';
            $normalizedName = null;
            
            if ($locationId === '6') {
                $airportId = 5257; // MCT
                $abriviation = 'MCT';
                $city = 'Muscat';
                $normalizedName = 'Muscat International Airport';
            } elseif ($locationId === '7') {
                $airportId = 5276; // SLL
                $abriviation = 'SLL';
                $city = 'Salalah';
                $normalizedName = 'Salalah International Airport';
            }

            $finalName = $normalizedName ?: $locationName;
            $finalAddress = $normalizedName ?: ($address ?: $locationName);

            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUserId,
                    'station_id' => $locationId,
                ],
                [
                    'name' => $finalName,
                    'normalized_name' => $normalizedName ?: $locationName,
                    'location' => $finalName,
                    'adresse' => $finalAddress,
                    'city' => $city,
                    'country' => 'Oman',
                    'currency' => 'OMR',
                    'location_type' => $airportId ? 'Airport' : 'Downtown',
                    'abriviation' => $abriviation,
                    'airport_id' => $airportId,
                    'activation' => $location['is_active'] ?? true,
                ]
            );

            if ($branch->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        if (!$this->option('dry-run')) {
            $this->info("Sync complete. Created: {$created}, Updated: {$updated}.");
        }

        return self::SUCCESS;
    }
}
