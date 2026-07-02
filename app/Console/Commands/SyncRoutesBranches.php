<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\RoutesApiService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class SyncRoutesBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'routes:sync-branches';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync branches from Routes API into Autours';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $service = new RoutesApiService();

        // 1. Resolve or create the Routes supplier user
        $supplierUser = User::firstOrCreate(
            ['email' => 'tsingh@routes.ca'],
            [
                'name' => 'Routes Car Rental',
                'role' => 'active_supplier',
                'password' => Hash::make('Qrentals@12345'),
                'company' => 'Routes',
            ]
        );

        $this->info("Supplier user resolved: ID {$supplierUser->id} ({$supplierUser->email})");

        // 2. Fetch locations from API
        $this->info('Fetching locations from Routes API...');
        $locations = $service->getLocations();

        if (empty($locations)) {
            $this->warn('No locations found or failed to fetch locations. Please ensure the API is reachable or load manually.');
            return self::FAILURE;
        }

        $this->info(sprintf('Found %d locations.', count($locations)));

        // 3. Process locations
        $syncedCount = 0;
        foreach ($locations as $loc) {
            // Upsert branch
            $branch = Branch::updateOrCreate(
                [
                    'company_id' => $supplierUser->id,
                    'station_id' => $loc['LocationCode'],
                ],
                [
                    'name' => $loc['LocationName'] ?? $loc['LocationCode'],
                    'location' => $loc['LocationName'] ?? $loc['LocationCode'],
                    'address' => $loc['Address'] ?? null,
                    'adresse' => $loc['Address'] ?? null,
                    'phone' => $loc['ContactNumber'] ?? null,
                    'city' => $loc['LocationName'] ?? null,
                    'currency' => $loc['Currency'] ?? null,
                    'lat' => $loc['Latitude'] ?? null,
                    'lng' => $loc['Longitude'] ?? null,
                    'country' => 'Canada', // Default based on context
                ]
            );

            $syncedCount++;
        }

        $this->info("Successfully synced {$syncedCount} branches.");
        return self::SUCCESS;
    }
}
