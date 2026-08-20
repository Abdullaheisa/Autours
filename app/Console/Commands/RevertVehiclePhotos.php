<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;

class RevertVehiclePhotos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicles:revert-photos {csv_path : Absolute path to the CSV report file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Revert vehicle photos to their original state using a previously generated CSV report.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $csvPath = $this->argument('csv_path');

        if (!file_exists($csvPath)) {
            $this->error("CSV file not found at: {$csvPath}");
            return self::FAILURE;
        }

        $this->info("Reverting photos using report: {$csvPath}");

        $csvFile = fopen($csvPath, 'r');
        $headers = fgetcsv($csvFile); // Skip header row

        $revertedCount = 0;
        $notFoundCount = 0;

        // Since we don't know exact total beforehand without counting, we just show a counter
        while (($row = fgetcsv($csvFile)) !== false) {
            // Columns: ['Vehicle ID', 'Vehicle Name', 'Supplier ID', 'Pickup Loc', 'Old Photo', 'New Photo', 'Status']
            $vehicleId = $row[0] ?? null;
            $oldPhoto = $row[4] ?? null;
            $status = $row[6] ?? null;

            if ($status === 'Changed' && $vehicleId) {
                // Keep the oldPhoto exactly as it was, even if it was empty/null
                if ($oldPhoto === '') {
                    $oldPhoto = null;
                }

                $vehicle = Vehicle::find($vehicleId);
                if ($vehicle) {
                    $vehicle->update(['photo' => $oldPhoto]);
                    $revertedCount++;
                } else {
                    $notFoundCount++;
                }
            }
        }

        fclose($csvFile);

        $this->info("Successfully reverted photos for {$revertedCount} vehicles.");
        if ($notFoundCount > 0) {
            $this->warn("Could not find {$notFoundCount} vehicles in the database (they might have been deleted).");
        }

        return self::SUCCESS;
    }
}
