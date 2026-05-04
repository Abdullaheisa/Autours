<?php

namespace App\Listeners;

use App\Events\SendEmailEvent;
use App\Mail\SubscribeMail\SendBeSupplierEmail;
use App\Mail\SubscribeMail\SendOffersEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class
SendEmail implements ShouldQueue
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
    public function handle(SendEmailEvent $event): void
    {
        $body = [];

        if($event->type == 'offers') {
             Mail::to($event->email)->send(new SendOffersEmail($body));
        }

        if($event->type == 'supplier') {
            Mail::to($event->email)->send(new SendBeSupplierEmail($body));
        }
    }
}
