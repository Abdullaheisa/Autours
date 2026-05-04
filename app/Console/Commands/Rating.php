<?php

namespace App\Console\Commands;

use App\Enums\RentalStatuses;
use App\Mail\RentalRateRequestMail;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class Rating extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:rating';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $rentalsHasNoReview = Rental::query()->whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
            ->whereDate('end_date','<', Carbon::now()->toDateString())
            ->whereDate('end_date','>=', Carbon::now()->subDays(5)->toDateString())
            ->whereNull('rate')
            ->with(['customer'])->get();
        foreach ($rentalsHasNoReview as $rentalHasNoReview) {
            $rentalHasNoReview->review_form_link = url('rentals/rate?id='. $rentalHasNoReview->id .'&key=' .encrypt(base64_encode($rentalHasNoReview->customer->email .','. Carbon::now()->addDays(2)->toDateString()), env('APP_KEY')));
            Mail::to($rentalHasNoReview->customer->email)->send(new RentalRateRequestMail\RentalRateRequestMail($rentalHasNoReview));

        }
    }
}
