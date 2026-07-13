<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;

class SyncMovigoVehicles extends AbstractKolaycarVehicleSyncCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'movigo:sync-vehicles
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
    protected $description = 'Sync vehicles from Movigo API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@movigocarental.com';
    }

    protected function getSupplierName(): string
    {
        return 'Movigo';
    }

    protected function getSupplierCompany(): string
    {
        return 'Movigo Car Rental';
    }

    protected function getApiKey(): ?string
    {
        return 'rBBj07xzP9Fd8pSAFIdjbQ==';
    }

    protected function getApiPassword(): ?string
    {
        return 'MolC.!8695gF1';
    }

    protected function getTagPrefix(): string
    {
        return 'Movigo-ID';
    }
}
