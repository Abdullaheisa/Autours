<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Http\Requests\AssignRentalTerm;
use App\Http\Requests\CreateRentalTerms;
use App\Models\RentalTerms;
use App\Models\SupplierRentalTerm;
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
use App\Exports\RentalTermsTemplateExport;
use App\Imports\RentalTermsImport;
use Maatwebsite\Excel\Facades\Excel;

class RentalTermsController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function getActiveSupplierCountries(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        if (!$user) {
            return response()->json([], 401);
        }

        // 1. Get countries where supplier has active branches (activation = 1)
        $branchCountries = Branch::query()
            ->where('company_id', $user->id)
            ->where('activation', 1)
            ->whereNotNull('country')
            ->pluck('country')
            ->map(function($c) { return \App\Services\CountryCurrencyResolver::normalizeCountryName($c); })
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        // 2. Filter countries to those that also have active vehicles (activation = 1)
        $activeVehicleCountries = Vehicle::query()
            ->where('supplier', $user->id)
            ->where('activation', 1)
            ->whereHas('branch', function($q) use ($user) {
                $q->where('activation', 1)->where('company_id', $user->id);
            })
            ->with('branch')
            ->get()
            ->map(function($v) {
                return $v->branch && $v->branch->country ? \App\Services\CountryCurrencyResolver::normalizeCountryName($v->branch->country) : null;
            })
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $validCountries = array_values(array_intersect($branchCountries, $activeVehicleCountries));

        // Fallback: If vehicle check array is empty, return active branch countries
        if (empty($validCountries) && !empty($branchCountries)) {
            $validCountries = array_values($branchCountries);
        }

        return response()->json($validCountries);
    }

    public function getActiveSupplierBranches(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        if (!$user) {
            return response()->json([], 401);
        }

        $country = $request->input('country');
        $normalizedCountry = $country ? \App\Services\CountryCurrencyResolver::normalizeCountryName($country) : null;

        $query = Branch::query()
            ->where('company_id', $user->id)
            ->where('activation', 1);

        if ($country) {
            $query->where(function($q) use ($country, $normalizedCountry) {
                $q->whereRaw('LOWER(country) = ?', [strtolower($country)]);
                if ($normalizedCountry) {
                    $q->orWhereRaw('LOWER(country) = ?', [strtolower($normalizedCountry)]);
                }
            });
        }

        $branches = $query->select(['id', 'name', 'city', 'country', 'adresse', 'location_type', 'abriviation'])->get();
        return response()->json($branches);
    }

    public function index(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user()
             ?? \Illuminate\Support\Facades\Auth::user();
        $country = \App\Services\CountryCurrencyResolver::normalizeCountryName($request->input('country'));
        $branchId = $request->input('branch_id');

        if ($user && ($user->role == 'active_supplier' || $user->role == 'supplier' || $user->role == 'under_review')) {
            // Strict Supplier & Country Isolation: Only terms created by this supplier for this country
            $query = RentalTerms::query()->where('created_by', $user->id)->with('branch:id,name,city,country,adresse,location_type,abriviation');
            if ($country) {
                $query->where('country', $country);
            }
            if ($branchId !== null && $branchId !== '' && $branchId !== 'all') {
                if ($branchId === 'country_only' || $branchId === 'null') {
                    $query->whereNull('branch_id');
                } else {
                    $query->where('branch_id', (int)$branchId);
                }
            }
            $terms = $query->latest('id')->get();
            return response()->json($terms);
        }

        // For Admin / Public
        $query = RentalTerms::query()->with('branch:id,name,city,country,adresse,location_type,abriviation');
        if ($country) {
            $query->where('country', $country);
        }
        if ($branchId !== null && $branchId !== '' && $branchId !== 'all') {
            if ($branchId === 'country_only' || $branchId === 'null') {
                $query->whereNull('branch_id');
            } else {
                $query->where('branch_id', (int)$branchId);
            }
        }
        return response()->json($query->latest('id')->get());
    }

    public function insert(Request $request)
    {
        try {
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \auth()->user();
            if (!$user) {
                return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
            }

            $rental = new RentalTerms();
            $rental->title = $request->title;
            $rental->description = $request->description;
            $rental->status = $request->status ?? 'approved';
            $rental->country = \App\Services\CountryCurrencyResolver::normalizeCountryName($request->country);
            $rental->branch_id = $request->filled('branch_id') && is_numeric($request->branch_id) ? (int)$request->branch_id : null;
            $rental->created_by = $user->id;
            $rental->save();

            $rental->load('branch:id,name,city,country,adresse,location_type,abriviation');

            return response()->json([
                'status' => true,
                'data' => $rental
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function bulkUpload(Request $request)
    {
        try {
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \auth()->user();
            if (!$user) {
                return response()->json(['status' => false, 'message' => 'Unauthenticated'], 401);
            }

            $request->validate([
                'file' => 'required|file|mimes:xlsx,xls,csv',
                'country' => 'required|string',
            ]);

            $file = $request->file('file');
            $country = \App\Services\CountryCurrencyResolver::normalizeCountryName($request->input('country'));
            $branchId = $request->filled('branch_id') && is_numeric($request->branch_id) ? (int)$request->branch_id : null;
            $extension = strtolower($file->getClientOriginalExtension());
            $items = [];

            if (in_array($extension, ['xlsx', 'xls', 'csv'])) {
                // Use proper Maatwebsite Excel Import
                $import = new RentalTermsImport();
                Excel::import($import, $file);
                $items = $import->items;
            } else {
                return response()->json([
                    'status' => false,
                    'message' => 'Unsupported file format. Please upload Excel (.xlsx, .xls, .csv) template.'
                ], 400);
            }

            $created = [];
            foreach ($items as $item) {
                if (empty($item['title'])) continue;
                $term = RentalTerms::create([
                    'title' => $item['title'],
                    'description' => $item['description'],
                    'status' => 'approved',
                    'country' => $country,
                    'branch_id' => $branchId,
                    'created_by' => $user->id,
                ]);
                $created[] = $term;
            }

            return response()->json([
                'status' => true,
                'count' => count($created),
                'message' => count($created) . ' rental term(s) imported successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadTemplate(Request $request)
    {
        if (ob_get_level()) {
            ob_end_clean();
        }
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\RentalTermsTemplateExport, 'rental_terms_template.xlsx');
    }

    public function show($id)
    {
        return RentalTerms::query()->find($id);
    }

    public function edit(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        $term = RentalTerms::query()->find($request->id);
        
        if ($term && $user && $term->created_by == $user->id) {
            $data = $request->except('id');
            if (isset($data['country'])) {
                $data['country'] = \App\Services\CountryCurrencyResolver::normalizeCountryName($data['country']);
            }
            if (array_key_exists('branch_id', $data)) {
                $data['branch_id'] = (!empty($data['branch_id']) && is_numeric($data['branch_id'])) ? (int)$data['branch_id'] : null;
            }
            $term->update($data);
            $term->load('branch:id,name,city,country,adresse,location_type,abriviation');
            return response()->json(['status' => true, 'data' => $term]);
        }
        return response()->json(['status' => false, 'message' => 'Unauthorized or term not found'], 403);
    }

    public function destroy(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        $term = RentalTerms::query()->find($request->id);

        if ($term && $user && $term->created_by == $user->id) {
            $status = $term->delete();
            return response()->json([
                'status' => $status,
                'data' => []
            ]);
        }
        return response()->json(['status' => false, 'message' => 'Unauthorized or term not found'], 403);
    }

    public function assignRentalTerms(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $termId = $request->input('term_id') ?? $request->input('rental_term_id');
        if (!$termId) {
            return response()->json(['message' => 'The term id is required.'], 422);
        }

        $country = $request->has('country') ? \App\Services\CountryCurrencyResolver::normalizeCountryName($request->input('country')) : null;

        $checkQuery = SupplierRentalTerm::query()
            ->where('supplier_id', $user->id)
            ->where('rental_term_id', $termId);
        
        if ($country) {
            $checkQuery->where('country', $country);
        } else {
            $checkQuery->whereNull('country');
        }

        $checkIfSelected = $checkQuery->get();

        if ($checkIfSelected->count()) {
            $deleteQuery = SupplierRentalTerm::query()
                ->where('supplier_id', $user->id)
                ->where('rental_term_id', $termId);
            
            if ($country) {
                $deleteQuery->where('country', $country);
            } else {
                $deleteQuery->whereNull('country');
            }
            
            $status = $deleteQuery->delete();
        } else {
            $status = SupplierRentalTerm::query()->insert([
                'supplier_id' => $user->id, 
                'rental_term_id' => $termId,
                'country' => $country
            ]);
        }
        return response()->json([
            'status' => $status,
            'data' => []
        ]);
    }

    public function approveOrReject(Request $request)
    {
        try {
            $term = RentalTerms::query()->find($request->id);
            $term->update(['status'=> $request->status]);
            if($term->created_by) {
                SupplierRentalTerm::query()->insert([
                    'supplier_id' => RentalTerms::query()->find($request->id)->created_by,
                    'rental_term_id' => $request->id
                ]);
            }
            return response()->json([
                'status' => 1,
                'message' => ''
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }
}
