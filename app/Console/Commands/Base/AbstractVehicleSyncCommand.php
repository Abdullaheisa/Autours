<?php

declare(strict_types=1);

namespace App\Console\Commands\Base;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

abstract class AbstractVehicleSyncCommand extends Command
{
    /**
     * Start time of the sync for duration tracking.
     */
    protected float $startTime;

    /**
     * Counters for monitoring and summary reporting.
     */
    protected int $createdCount = 0;
    protected int $updatedCount = 0;
    protected int $deactivatedCount = 0;
    protected int $failedCount = 0;

    /**
     * Get the supplier human-readable name for logging (e.g. "Badger", "Wheelsys").
     */
    abstract protected function getSupplierDisplayName(): string;

    /**
     * Execute the vehicle sync command wrapper with monitoring, duration tracking, and error trapping.
     */
    public function handle(): int
    {
        $this->startTime = microtime(true);
        $supplierName = $this->getSupplierDisplayName();
        $pricesOnly = $this->hasOption('prices-only') && $this->option('prices-only');
        $modeStr = $pricesOnly ? 'PRICES ONLY' : 'FULL SYNC';

        $this->info("Starting {$supplierName} vehicle sync ({$modeStr})...");
        Log::info("SYNC_START: {$supplierName} vehicle sync started in {$modeStr} mode.");

        try {
            $status = $this->performSync();
        } catch (\Throwable $e) {
            $this->failedCount++;
            Log::error("SYNC_ERROR: {$supplierName} vehicle sync failed: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            $this->error("Error syncing {$supplierName}: " . $e->getMessage());
            $status = self::FAILURE;
        }

        $duration = round(microtime(true) - $this->startTime, 2);

        $this->newLine();
        $this->info("========== {$supplierName} Vehicle Sync Complete ==========");
        $this->info("Duration    : {$duration}s");
        $this->info("Created     : {$this->createdCount}");
        $this->info("Updated     : {$this->updatedCount}");
        $this->info("Deactivated : {$this->deactivatedCount}");
        $this->info("Failed      : {$this->failedCount}");
        $this->info('========================================================');

        Log::info("SYNC_END: {$supplierName} vehicle sync finished in {$duration}s.", [
            'supplier' => $supplierName,
            'duration_seconds' => $duration,
            'created' => $this->createdCount,
            'updated' => $this->updatedCount,
            'deactivated' => $this->deactivatedCount,
            'failed' => $this->failedCount,
            'prices_only' => $pricesOnly,
            'status' => $status === self::SUCCESS ? 'success' : 'failure',
        ]);

        return $status;
    }

    /**
     * Perform the actual synchronization logic.
     */
    abstract protected function performSync(): int;
}
