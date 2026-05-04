<?php

namespace App\Listeners\NewSupplier;

use App\Events\NewSupplier;
use App\Mail\NewRental\NewBookingAdmin;
use App\Mail\Suppliers\NewSupplierEmailAdmin;
use App\Models\Branch;
use App\Models\Category;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class NotifyNewSupplierToAdmin implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(NewSupplier $event): void
    {
        $body = $event->user;
         Mail::to("contact@autours.net")->send(new NewSupplierEmailAdmin($body));
    }
}
