<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Console\Commands\Base\AbstractKolaycarVehicleSyncCommand;

class SyncAllmeetVehicles extends AbstractKolaycarVehicleSyncCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'allmeet:sync-vehicles
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
    protected $description = 'Sync vehicles from Allmeet API into Autours.';

    protected function getSupplierEmail(): string
    {
        return 'info@allmeetrentacar.com';
    }

    protected function getSupplierName(): string
    {
        return 'Allmeet';
    }

    protected function getSupplierCompany(): string
    {
        return 'Allmeet Rent a Car';
    }

    protected function getApiKey(): ?string
    {
        return 'pQX1iJ70I9eKepswD8dsAw==';
    }

    protected function getApiPassword(): ?string
    {
        return '!Cu89.!Wi4691';
    }

    protected function getTagPrefix(): string
    {
        return 'Allmeet-ID';
    }
}
