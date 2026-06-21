<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Console\Commands\Traits\NormalizesVehicleNames as NormalizesVehicleNamesTrait;

class NormalizeVehicleNames extends Command
{
    use NormalizesVehicleNamesTrait;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicles:normalize-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Normalize the names of all vehicles in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting vehicle name normalization...');

        $vehicles = Vehicle::all();
        $updatedCount = 0;
        $processedCount = 0;

        $bar = $this->output->createProgressBar(count($vehicles));

        foreach ($vehicles as $vehicle) {
            $processedCount++;
            $originalName = $vehicle->name;
            $normalizedName = $this->normalizeVehicleName((string) $originalName);

            if ($originalName !== $normalizedName) {
                $vehicle->name = $normalizedName;
                $vehicle->save();
                $updatedCount++;
                // Optionally log the change
                // $this->line("\nUpdated: '{$originalName}' -> '{$normalizedName}'");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Normalization complete!");
        $this->info("Processed: {$processedCount} vehicles");
        $this->info("Updated: {$updatedCount} vehicles");

        return self::SUCCESS;
    }
}
