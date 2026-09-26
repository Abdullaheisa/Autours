<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Specification;
use App\Models\Vehicle;
use App\Models\Branch;
use App\Models\VehiclesPhotos;
use App\Models\Rental;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class CountryController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {
        $query = Branch::query()
            ->whereHas('company', function ($query) {
                $query->where('role', 'active_supplier');
            });

        $supplier = $request->get('supplier_id', $request->get('company_id', $request->get('supplier')));
        if (!empty($supplier) && $supplier !== 'All') {
            $query->where('company_id', $supplier);
        }

        return $query
            ->distinct('country')
            ->get()
            ->unique('country')
            ->pluck('country')
            ->values();
    }

}
