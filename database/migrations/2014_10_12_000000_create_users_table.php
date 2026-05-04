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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->text('logo')->nullable();
            $table->string('name');
            $table->string('gender')->nullable();
            $table->string('country')->nullable();
            $table->string('company')->nullable();
            $table->string('address')->nullable();
            $table->string('email')->unique()->nullable();
            $table->string('phone_num')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role');
            $table->decimal('price_tax', 8, 2)->nullable();
            $table->decimal('week_price_tax', 8, 2)->nullable();
            $table->decimal('month_price_tax', 8, 2)->nullable();
            $table->decimal('year_price_tax', 8, 2)->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
