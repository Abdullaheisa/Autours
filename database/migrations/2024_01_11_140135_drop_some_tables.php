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
       Schema::drop('password_reset_tokens');
       Schema::drop('password_resets');
       Schema::drop('personal_access_tokens');
       Schema::drop('policies');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
