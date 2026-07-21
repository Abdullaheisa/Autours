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

class RentalTermsController extends Controller
{
    /**
     * Display a listing of the resource.
     */


    public function index(Request $request)
    {
        $terms = RentalTerms::query();
        // Resolve via sanctum guard first (Bearer token), then fall back to session user
        $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user()
             ?? \Illuminate\Support\Facades\Auth::user();

        if ($request->has('my_terms') && $user) {
            return $terms->where('created_by', $user->id)->get();
        }

        if ($user && ($user->role == 'active_supplier' || $user->role == 'supplier' || $user->role == 'under_review')) {
            $terms = $terms->where('status', 'approved')->get();
            $selected = SupplierRentalTerm::query()
                ->where('supplier_id', $user->id)
                ->get()->pluck('rental_term_id')->toArray();
            foreach ($terms as $term) {
                $term->selected = in_array($term->id, $selected) ? 1 : 0;
            }
        } else {
            $terms = $terms->get();
        }
        return $terms;
    }


    public function insert(CreateRentalTerms $request)
    {
        try {
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \auth()->user();
            $rental = new RentalTerms();
            $rental->title = $request->title;
            $rental->description = $request->description;
            $rental->status = $request->status ?? 'approved';
            $rental->created_by = $user ? $user->id : 1;
            $rental->save();

            return response()->json([
                'status' => true,
                'data' => []
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
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

        $checkIfSelected = SupplierRentalTerm::query()->where('supplier_id', $user->id)->where('rental_term_id', $termId)->get();
        if ($checkIfSelected->count()) {
            $status = SupplierRentalTerm::query()->where('supplier_id', $user->id)->where('rental_term_id', $termId)->delete();
        } else {
            $status = SupplierRentalTerm::query()->insert(['supplier_id' => $user->id, 'rental_term_id' => $termId]);
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
