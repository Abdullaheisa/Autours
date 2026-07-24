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
            ->map(function($c) { return trim($c); })
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
                return $v->branch && $v->branch->country ? trim($v->branch->country) : null;
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

    public function index(Request $request)
    {
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user()
             ?? \Illuminate\Support\Facades\Auth::user();
        $country = $request->input('country');

        if ($user && ($user->role == 'active_supplier' || $user->role == 'supplier' || $user->role == 'under_review')) {
            // Strict Supplier & Country Isolation: Only terms created by this supplier for this country
            $query = RentalTerms::query()->where('created_by', $user->id);
            if ($country) {
                $query->where('country', $country);
            }
            $terms = $query->get();
            return response()->json($terms);
        }

        // For Admin / Public
        $query = RentalTerms::query();
        if ($country) {
            $query->where('country', $country);
        }
        return response()->json($query->get());
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
            $rental->country = $request->country;
            $rental->created_by = $user->id;
            $rental->save();

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
            $country = trim($request->input('country'));
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
            $term->update($request->except('id'));
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

        $checkQuery = SupplierRentalTerm::query()
            ->where('supplier_id', $user->id)
            ->where('rental_term_id', $termId);
        
        if ($request->has('country')) {
            $checkQuery->where('country', $request->country);
        } else {
            $checkQuery->whereNull('country');
        }

        $checkIfSelected = $checkQuery->get();

        if ($checkIfSelected->count()) {
            $deleteQuery = SupplierRentalTerm::query()
                ->where('supplier_id', $user->id)
                ->where('rental_term_id', $termId);
            
            if ($request->has('country')) {
                $deleteQuery->where('country', $request->country);
            } else {
                $deleteQuery->whereNull('country');
            }
            
            $status = $deleteQuery->delete();
        } else {
            $status = SupplierRentalTerm::query()->insert([
                'supplier_id' => $user->id, 
                'rental_term_id' => $termId,
                'country' => $request->input('country')
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
