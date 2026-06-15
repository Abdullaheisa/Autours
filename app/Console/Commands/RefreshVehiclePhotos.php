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
    protected $signature = 'vehicles:refresh-photos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh images of existing vehicles based on our local VehiclesPhotos matching logic without requiring a full sync. Generates a CSV report.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting vehicle photos refresh...');

        // Create CSV file for the report
        $reportPath = storage_path('app/vehicle_photos_refresh_report_' . date('Y-m-d_H-i-s') . '.csv');
        $csvFile = fopen($reportPath, 'w');
        fputcsv($csvFile, ['Vehicle ID', 'Vehicle Name', 'Supplier ID', 'Pickup Loc', 'Old Photo', 'New Photo', 'Status']);

        // Fetch only vehicles that were created via sync (they contain GROUP-ID in description)
        $vehicles = Vehicle::where('description', 'like', '%GROUP-ID%')->get();
        $updatedCount = 0;
        $unchangedCount = 0;
        $notFoundCount = 0;

        $progress = $this->output->createProgressBar($vehicles->count());
        $progress->start();

        foreach ($vehicles as $vehicle) {
            // Attempt to resolve a local photo based on the vehicle's name
            $localPhoto = $this->resolveLocalPhoto($vehicle->name);

            $oldPhoto = $vehicle->photo;
            $status = 'Unchanged';
            $newPhoto = $oldPhoto;

            if (!$localPhoto) {
                $status = 'No Local Photo Found';
            } elseif ($vehicle->photo !== $localPhoto) {
                $vehicle->update(['photo' => $localPhoto]);
                $status = 'Changed';
                $newPhoto = $localPhoto;
                $updatedCount++;
            } else {
                $status = 'Unchanged';
                $unchangedCount++;
            }

            fputcsv($csvFile, [
                $vehicle->id,
                $vehicle->name,
                $vehicle->supplier,
                $vehicle->pickup_loc,
                $oldPhoto,
                $newPhoto,
                $status
            ]);

            $progress->advance();
        }

        fclose($csvFile);

        $progress->finish();
        $this->newLine();

        $this->info("Successfully updated photos for {$updatedCount} vehicles.");
        $this->info("Vehicles unchanged: {$unchangedCount}");
        $this->info("Report generated at: {$reportPath}");
        return self::SUCCESS;
    }
}
