<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\RentalTerms;
use App\Models\SupplierRentalTerm;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $placeholderTerms = RentalTerms::where(function($q) {
            $q->where('title', 'like', '%العنوان%')
              ->orWhere('title', 'like', '%Title (العنوان)%')
              ->orWhere('title', 'Title')
              ->orWhere('description', 'like', '%الوصف والتفاصيل%')
              ->orWhere('description', 'Description');
        })->get();

        foreach ($placeholderTerms as $term) {
            // Remove any assigned supplier rental terms
            SupplierRentalTerm::where('rental_term_id', $term->id)->delete();
            // Delete the placeholder term
            $term->delete();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Placeholder terms should never be restored
    }
};
