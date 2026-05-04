<?php

namespace App\Listeners\NewSupplier;

use App\Events\NewRental;
use App\Events\NewSupplier;
use App\Mail\NewRental\NewBookingCustomer;
use App\Mail\Suppliers\NewSupplierEmailAdmin;
use App\Models\Branch;
use App\Models\Included;
use App\Models\LocationType;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class NotifyNewSupplier implements ShouldQueue
{
    /*
     * Create the event listener.
     */
    public function __construct()
    {
    }

    /**
     * Handle the event.
     */
    public function handle(NewSupplier $event): void
    {

        $body = $event->user;
        $status = Mail::to($event->user->email)->send(new NewSupplierEmailAdmin($body));
    }
}
