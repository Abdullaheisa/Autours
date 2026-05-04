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


    public function index()
    {
        $terms = RentalTerms::query();
        if (\auth()->user()->role == 'active_supplier') {
            $terms = $terms->where('created_by', \auth()->user()->id)->get();
            $selected = SupplierRentalTerm::query()
                ->where('supplier_id', \auth()->user()->id)
                ->get()->pluck('rental_term_id')->toArray();
            foreach ($terms as $term) {
                if (in_array($term->id, $selected)) {
                    $term->selected = 1;
                } else {
                    $term->selected = 0;

                }
            }
        } else {
            $terms = $terms->get();
        }
        return $terms;
    }


    public function insert(CreateRentalTerms $request)
    {
        try {
            $rental = new RentalTerms();
            $rental->title = $request->title;
            $rental->description = $request->description;
            $rental->status = $request->status;
            $rental->created_by = \auth()->user()->id;
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
        return RentalTerms::query()->find($request->id)->update($request->except('id'));
    }

    public function destroy(Request $request)
    {
        $status = RentalTerms::query()->find($request->id)->delete();
        return response()->json([
            'status' => $status,
            'data' => []
        ]);
    }

    public function assignRentalTerms(AssignRentalTerm $request)
    {
        $checkIfSelected = SupplierRentalTerm::query()->where('supplier_id', auth()->user()->id)->where('rental_term_id', $request->term_id)->get();
        if ($checkIfSelected->count()) {
            $status = SupplierRentalTerm::query()->where('supplier_id', auth()->user()->id)->where('rental_term_id', $request->term_id)->delete();
        } else {
            $status = SupplierRentalTerm::query()->insert(['supplier_id' => auth()->user()->id, 'rental_term_id' => $request->term_id]);
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
