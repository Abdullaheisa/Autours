<?php

namespace App\Listeners\UpdateRental;

use App\Events\UpdateRental;
use App\Models\Rental;
use App\Services\SupplierIntegrationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendUpdateToIntegratedSupplierListener implements ShouldQueue
{
    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = 60;

    /**
     * Create the event listener.
     */
    public function __construct(
        private SupplierIntegrationService $integrationService
    ) {
    }

    /**
     * Handle the event.
     */
    public function handle(UpdateRental $event): void
    {
        $rental = Rental::with(['vehicle', 'customer', 'supplier', 'paymentMethod'])
            ->find($event->rental->id ?? $event->rental);

        if (!$rental) {
            return;
        }

        $this->integrationService->sendRentalUpdate($rental);
    }
}

