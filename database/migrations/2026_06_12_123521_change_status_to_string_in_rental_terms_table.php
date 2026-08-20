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
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status DROP DEFAULT");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status TYPE VARCHAR(255) USING (CASE WHEN status=1 THEN 'approved' WHEN status=0 THEN 'rejected' ELSE 'pending' END)");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status SET DEFAULT 'pending'");
        } else {
            Schema::table('rental_terms', function (Blueprint $table) {
                $table->string('status')->default('pending')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (\Illuminate\Support\Facades\DB::getDriverName() === 'pgsql') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status DROP DEFAULT");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status TYPE INTEGER USING (CASE WHEN status='approved' THEN 1 WHEN status='rejected' THEN 0 ELSE 2 END)");
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rental_terms ALTER COLUMN status SET DEFAULT 2");
        } else {
            Schema::table('rental_terms', function (Blueprint $table) {
                $table->integer('status')->default(2)->change();
            });
        }
    }
};
