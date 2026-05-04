<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \App\Models\Included::query()->create([
            "id" => 48,
            "description" => "Enjoy Free Cancellation up to 48 Hours before Pick-Up!",
            "what_is_included" => "Free Cancellation (48h)!",
            "created_at" => now(),
            "updated_at" => now()
        ])->save();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
