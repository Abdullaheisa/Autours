<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;

class RefreshVehiclePhotos extends Command
{
    use ResolvesLocalVehiclePhoto;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicles:refresh-photos
                            {--clear-external : Null out all externally-downloaded supplier photos before refreshing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh images of existing vehicles based on our local VehiclesPhotos matching logic without requiring a full sync. Generates a CSV report.';

    /**
     * Prefixes used by supplier sync commands when downloading images from external APIs.
     */
    private const EXTERNAL_PHOTO_PREFIXES = [
        'surprice_',
        'jimpisoft_',
        'wheelsys_',
        'xdrive_',
        'nissa_',
        'emr_',
        'renteon_',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Step 1: Optionally clear external photos
        if ($this->option('clear-external')) {
            $this->clearExternalPhotos();
        }

        $this->info('Starting vehicle photos refresh...');

        // Create CSV file for the report
        $reportPath = storage_path('app/vehicle_photos_refresh_report_' . date('Y-m-d_H-i-s') . '.csv');
        $csvFile = fopen($reportPath, 'w');
        fputcsv($csvFile, ['Vehicle ID', 'Vehicle Name', 'Supplier ID', 'Pickup Loc', 'Old Photo', 'New Photo', 'Status']);

        // Fetch all vehicles across all suppliers to refresh their local photos from VehiclesPhotos mapping
        $vehicles = Vehicle::all();
        $updatedCount = 0;
        $unchangedCount = 0;
        $notFoundCount = 0;

        $progress = $this->output->createProgressBar($vehicles->count());
        $progress->start();

        $missingNames = [];

        foreach ($vehicles as $vehicle) {
            // Attempt to resolve a local photo based on the vehicle's name
            $localPhoto = $this->resolveLocalPhoto($vehicle->name);

            if (!$localPhoto) {
                $notFoundCount++;
                if (!isset($missingNames[$vehicle->name])) {
                    $missingNames[$vehicle->name] = true;
                    fputcsv($csvFile, [
                        $vehicle->id,
                        $vehicle->name,
                        $vehicle->supplier,
                        $vehicle->pickup_loc,
                        $vehicle->photo,
                        $vehicle->photo,
                        'No Local Photo Found'
                    ]);
                }
            } elseif ($vehicle->photo !== $localPhoto) {
                $vehicle->update(['photo' => $localPhoto]);
                $updatedCount++;
            } else {
                $unchangedCount++;
            }

            $progress->advance();
        }

        fclose($csvFile);

        $progress->finish();
        $this->newLine();

        $this->info("Successfully updated photos for {$updatedCount} vehicles.");
        $this->info("Vehicles unchanged: {$unchangedCount}");
        $this->info("Vehicles missing photos: {$notFoundCount} (" . count($missingNames) . " unique)");
        $this->info("Report generated at: {$reportPath}");
        return self::SUCCESS;
    }

    /**
     * Null out all vehicle photos that were downloaded from external supplier APIs.
     * This includes photos with known supplier prefixes and full HTTP URLs.
     */
    private function clearExternalPhotos(): void
    {
        $this->info('Clearing externally-downloaded supplier photos...');

        $query = Vehicle::query();

        // Match supplier-prefixed filenames (e.g. surprice_xxx.jpg, emr_xxx.png)
        $query->where(function ($q) {
            foreach (self::EXTERNAL_PHOTO_PREFIXES as $prefix) {
                $q->orWhere('photo', 'LIKE', $prefix . '%');
            }
            // Also match full HTTP/HTTPS URLs stored directly
            $q->orWhere('photo', 'LIKE', 'http://%');
            $q->orWhere('photo', 'LIKE', 'https://%');
        });

        $count = $query->count();

        if ($count === 0) {
            $this->info('No external photos found to clear.');
            return;
        }

        $this->info("Found {$count} vehicles with external photos. Nulling them out...");

        $query->update(['photo' => null]);

        $this->info("Cleared {$count} external photos.");
    }
}
