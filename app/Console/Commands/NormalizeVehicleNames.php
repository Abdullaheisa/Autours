<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Vehicle;
use App\Models\VehicleSpecification;
use App\Console\Commands\Traits\NormalizesVehicleNames as NormalizesVehicleNamesTrait;
use App\Console\Commands\Traits\ResolvesLocalVehiclePhoto;

class NormalizeVehicleNames extends Command
{
    use NormalizesVehicleNamesTrait, ResolvesLocalVehiclePhoto;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vehicles:normalize-names {--supplier= : Optional supplier ID, email, or company name to filter}';

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
        $supplierOption = $this->option('supplier');
        $supplierId = null;
        if ($supplierOption) {
            if (is_numeric($supplierOption)) {
                $supplierId = (int) $supplierOption;
            } else {
                $user = \App\Models\User::where('email', $supplierOption)
                    ->orWhere('company', 'like', "%{$supplierOption}%")
                    ->orWhere('name', 'like', "%{$supplierOption}%")
                    ->first();
                if ($user) {
                    $supplierId = $user->id;
                } else {
                    $this->error("Supplier '{$supplierOption}' not found.");
                    return self::FAILURE;
                }
            }
            $this->info("Filtering by supplier ID: {$supplierId}");
        }

        $this->info('Starting vehicle name normalization...');

        // ------------------------------------------------------------------
        // Step 1: Title-case normalization
        // ------------------------------------------------------------------
        $vehicles = Vehicle::when($supplierId, fn($q) => $q->where('supplier', $supplierId))->get();
        $updatedCount = 0;
        $processedCount = 0;

        $bar = $this->output->createProgressBar(count($vehicles));

        foreach ($vehicles as $vehicle) {
            $processedCount++;
            $originalName = $vehicle->getRawOriginal('name') ?? $vehicle->name;

            // Prefer raw uncorrupted API string from description tag if available
            $sourceString = $originalName;
            if (!empty($vehicle->description) && preg_match('/^\[[A-Z0-9_-]+:\d+\]\s*(.+)$/is', $vehicle->description, $m)) {
                $sourceString = $m[1];
            }

            $normalizedName = $this->normalizeVehicleName((string) $sourceString);

            $updates = [];
            if ($originalName !== $normalizedName) {
                $updates['name'] = $normalizedName;
            }

            // Also check if local photo can be resolved/updated for the clean vehicle name
            $localPhoto = $this->resolveLocalPhoto($normalizedName);
            if ($localPhoto && $vehicle->photo !== $localPhoto) {
                $updates['photo'] = $localPhoto;
            }

            if (!empty($updates)) {
                Vehicle::where('id', $vehicle->id)->update($updates);
                $updatedCount++;
                $this->line("\nUpdated [ID: {$vehicle->id}]: '{$originalName}' -> '{$normalizedName}'");
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

        // Reload vehicles to get the freshly normalized names
        $vehicles = Vehicle::when($supplierId, fn($q) => $q->where('supplier', $supplierId))->get();
        $vehicleIds = $vehicles->pluck('id')->toArray();

        // Pre-load all transmission specs in one query: vehicle_id => value
        $transmissionSpecs = VehicleSpecification::where('name', 'Transmission')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('value', 'vehicle_id')
            ->toArray();

        // Also preload Automatic and Manual boolean specs as fallback
        $autoSpecs = VehicleSpecification::where('name', 'Automatic')
            ->where('value', 'Yes')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('vehicle_id', 'vehicle_id')
            ->toArray();

        $manualSpecs = VehicleSpecification::where('name', 'Manual')
            ->where('value', 'Yes')
            ->whereIn('vehicle_id', $vehicleIds)
            ->pluck('vehicle_id', 'vehicle_id')
            ->toArray();

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
                if (isset($autoSpecs[$vehicle->id])) {
                    $specValue = 'Automatic';
                } elseif (isset($manualSpecs[$vehicle->id])) {
                    $specValue = 'Manual';
                }
            }

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

            // Ensure Transmission spec exists
            VehicleSpecification::firstOrCreate(
                ['vehicle_id' => $vehicle->id, 'name' => 'Transmission'],
                ['value' => $transmission, 'icon' => 'las la-cogs']
            );

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

