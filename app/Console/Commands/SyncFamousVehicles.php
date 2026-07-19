<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;

class SyncFamousVehicles extends AbstractKolaycarVehicleSyncCommand
{
    protected $signature = 'famous:sync-vehicles
                            {--pickup-date= : Pickup date (yyyy-MM-dd HH:mm), defaults to tomorrow 10:00}
                            {--dropoff-date= : Dropoff date (yyyy-MM-dd HH:mm), defaults to day-after-tomorrow 10:00}
                            {--pickup= : Pickup date DD.MM.YYYY}
                            {--dropoff= : Dropoff date DD.MM.YYYY}
                            {--dry-run : Only fetch from API and print what would be done}
                            {--real : Perform the actual synchronization to the database}
                            {--prices-only : Only refresh per-branch prices, do not re-create vehicles or specs}';

    protected $description = 'Sync vehicles from Famous Rent A Car API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@famousrentacar.com';
    }

    protected function getSupplierName(): string
    {
        return 'Famous Rent A Car';
    }

    protected function getSupplierCompany(): string
    {
        return 'Famous Rent A Car';
    }

    protected function getApiKey(): ?string
    {
        return 'C0mMA5z64gqWPu5qs8MUjg==';
    }

    protected function getApiPassword(): ?string
    {
        return 'G.!369niS.!76';
    }

    protected function getTagPrefix(): string
    {
        return 'Famous-ID';
    }
}
