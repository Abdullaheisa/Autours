<?php

namespace App\Listeners\NewRental;

use App\Mail\NewRental\NewBookingAdmin;
use App\Models\Branch;
use App\Models\Category;
use App\Models\Included;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\VehicleIncluded;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class NotifyAdminListener implements ShouldQueue
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
    public function handle(object $event): void
    {
        $user = User::query()->where('role','admin')->first();
        $event->rental->vehicle = $event->rental->vehicle;
        $event->rental->paymentMethod = PaymentMethod::query()->find($event->rental->payment_method_id);
        $event->rental->vehicle->category = Category::query()->find($event->rental->vehicle->category_id);
        $event->rental->branch = Branch::query()->where('id', $event->rental->vehicle->pickup_loc)->first();
        $event->rental->supplier = User::query()->where('id', $event->rental->vehicle->supplier)->first();
        $event->rental->customer = User::query()->where('id', $event->rental->customer_id)->first();
        $event->rental->branch = Branch::query()->where('id', $event->rental->vehicle->pickup_loc)->first();
        $event->rental->cancelationPolicy = Included::query()->
        whereIn('id', VehicleIncluded::query()->whereIn('included_id', [1,48])->where('vehicle_id', $event->rental->vehicle->id)->get()->pluck('included_id')->toArray())->first();

        $body = $event->rental;
        $status = Mail::to(["admin@autours.net", "ahmedmoud@ymail.com"])->send(new NewBookingAdmin($body));
    }
}
