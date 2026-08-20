<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;

class SyncDriveAndSmileVehicles extends AbstractKolaycarVehicleSyncCommand
{
    protected $signature = 'driveandsmile:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles or specs}';

    protected $description = 'Sync vehicles from Drive and Smile API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@driveandsmile.com.tr';
    }

    protected function getSupplierName(): string
    {
        return 'Drive and Smile';
    }

    protected function getSupplierCompany(): string
    {
        return 'Drive and Smile';
    }

    protected function getApiKey(): ?string
    {
        return 'l1lmfb285d97knJUlxIlUA==';
    }

    protected function getApiPassword(): ?string
    {
        return 'autours2323';
    }

    protected function getTagPrefix(): string
    {
        return 'DriveAndSmile-ID';
    }
}
