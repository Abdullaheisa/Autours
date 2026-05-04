<?php

namespace App\Listeners\RentalRequest;

use App\Events\NewRental;
use App\Events\NewRentalRequest;
use App\Mail\NewRental\UpdateBookingSupplier;
use App\Mail\RentalRequest\NewBookingRequestSupplier;
use App\Models\Branch;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class RentalRequestNotifySupplierListener implements ShouldQueue
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
    public function handle(NewRentalRequest $event): void
    {

        $user = User::query()->find($event->rental->vehicle->supplier);
         $event->rental->vehicle = $event->rental->vehicle;
         $event->rental->branch = Branch::query()->where('id', $event->rental->vehicle->pickup_loc)->first();
         $event->rental->supplier = User::query()->where('id', $event->rental->vehicle->supplier)->first();
         $event->rental->customer = User::query()->where('id', $event->rental->customer_id)->first();
         $event->rental->request = new \stdClass();
         $event->rental->request->rental_id =  $event->rental->id;
         $event->rental->request->api_key = env('api-key');
         $event->rental->request->timestamp = Carbon::now()->toDateTime();

         $body = $event->rental;
         Mail::to($user->email)->send(new NewBookingRequestSupplier($body));
         Mail::to("ahmedmoud@ymail.com")->send(new NewBookingRequestSupplier($body));
         Mail::to("ahmed.moud765@gmail.com")->send(new NewBookingRequestSupplier($body));


    }
}
