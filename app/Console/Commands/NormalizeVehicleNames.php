<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
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
    protected $description = 'Normalize the names of all vehicles in the database (title-case + append transmission)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting vehicle name normalization...');

        // ------------------------------------------------------------------
        // Step 1: Title-case normalization
        // ------------------------------------------------------------------
        $vehicles = Vehicle::all();
        $updatedCount = 0;
        $processedCount = 0;

        $bar = $this->output->createProgressBar(count($vehicles));

        foreach ($vehicles as $vehicle) {
            $processedCount++;
            $originalName = $vehicle->getRawOriginal('name') ?? $vehicle->name;
            $normalizedName = $this->normalizeVehicleName((string) $originalName);

            if ($originalName !== $normalizedName) {
                Vehicle::where('id', $vehicle->id)->update(['name' => $normalizedName]);
                $updatedCount++;
                $this->line("\nUpdated: '{$originalName}' -> '{$normalizedName}'");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Title-case normalization complete!");
        $this->info("Processed: {$processedCount} vehicles");
        $this->info("Updated: {$updatedCount} vehicles");

        // ------------------------------------------------------------------
        // Step 2: Append transmission type from specifications
        // ------------------------------------------------------------------
        $this->newLine();
        $this->info('Appending transmission to vehicle names that are missing it...');

        // Pre-load all transmission specs in one query: vehicle_id => value
        $transmissionSpecs = VehicleSpecification::where('name', 'Transmission')
            ->pluck('value', 'vehicle_id')
            ->toArray();

        // Reload vehicles to get the freshly normalized names
        $vehicles = Vehicle::all();
        $transmissionCount = 0;

        $bar2 = $this->output->createProgressBar(count($vehicles));

        foreach ($vehicles as $vehicle) {
            $currentName = $vehicle->getRawOriginal('name') ?? $vehicle->name;

            // Skip if name already contains a transmission keyword
            if ($this->nameHasTransmission($currentName)) {
                $bar2->advance();
                continue;
            }

            // Look up the transmission from specs
            $specValue = $transmissionSpecs[$vehicle->id] ?? null;
            if (empty($specValue)) {
                $bar2->advance();
                continue;
            }

            // Resolve to "Automatic" or "Manual"
            $transmission = $this->resolveTransmissionLabel($specValue);
            if ($transmission === null) {
                $bar2->advance();
                continue;
            }

            $newName = $currentName . ' ' . $transmission;
            Vehicle::where('id', $vehicle->id)->update(['name' => $newName]);
            $transmissionCount++;
            $this->line("\nAppended: '{$currentName}' -> '{$newName}'");

            $bar2->advance();
        }

        $bar2->finish();
        $this->newLine(2);

        $this->info("Transmission append complete!");
        $this->info("Vehicles updated with transmission: {$transmissionCount}");

        return self::SUCCESS;
    }

    /**
     * Check if a vehicle name already contains a transmission keyword.
     */
    private function nameHasTransmission(string $name): bool
    {
        return (bool) preg_match('/\b(Automatic|Manual|Diesel|Electric|Hybrid)\b/i', $name);
    }

    /**
     * Resolve a transmission spec value to "Automatic" or "Manual".
     */
    private function resolveTransmissionLabel(string $value): ?string
    {
        $lower = strtolower(trim($value));

        if (str_contains($lower, 'auto') || str_contains($lower, 'automtic')) {
            return 'Automatic';
        }

        if (str_contains($lower, 'manual')) {
            return 'Manual';
        }

        return null;
    }
}

