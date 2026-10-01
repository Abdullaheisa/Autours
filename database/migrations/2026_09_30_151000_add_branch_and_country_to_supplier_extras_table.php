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
        Schema::table('supplier_extras', function (Blueprint $table) {
            // Drop old unique constraint if it exists so we can support multiple scopes
            try {
                $table->dropUnique(['supplier_id', 'extra_id']);
            } catch (\Throwable $e) {
                // Ignore if unique index name differs or does not exist
            }

            if (!Schema::hasColumn('supplier_extras', 'branch_id')) {
                $table->unsignedBigInteger('branch_id')->nullable()->after('supplier_id')->index();
            }
            if (!Schema::hasColumn('supplier_extras', 'country')) {
                $table->string('country', 100)->nullable()->after('branch_id')->index();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supplier_extras', function (Blueprint $table) {
            if (Schema::hasColumn('supplier_extras', 'branch_id')) {
                $table->dropColumn('branch_id');
            }
            if (Schema::hasColumn('supplier_extras', 'country')) {
                $table->dropColumn('country');
            }
        });
    }
};
