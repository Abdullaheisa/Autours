<?php

use App\Models\RateQuestion;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        RateQuestion::query()->insert([
            [
                "question" => "How would you rate your overall experience with the car rental company ?"
            ],
            [
                "question" => "Was the car as described and agreed upon during the booking ?"
            ],
            [
                "question" => "How would you rate the cleanliness and condition of the car upon pick-up ?"
            ],
            [
                "question" => "Did you encounter any issues during the pick-up or drop-off process ?"
            ],
            [
                "question" => "Was it easy to locate the company’s office or pick-up point ?"
            ],
            [
                "question" => "Would you recommend this company or use their services again ?"
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
