<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;

class SyncKolaycarVehicles extends AbstractKolaycarVehicleSyncCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'kolaycar:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles or specs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync vehicles from Kolaycar (Arscar) API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@arscar.com.tr';
    }

    protected function getSupplierName(): string
    {
        return 'Arscar';
    }

    protected function getSupplierCompany(): string
    {
        return 'Arscar / Kolaycar';
    }

    protected function getApiKey(): ?string
    {
        return null;
    }

    protected function getApiPassword(): ?string
    {
        return null;
    }

    protected function getTagPrefix(): string
    {
        return 'Kolaycar-ID';
    }
}
