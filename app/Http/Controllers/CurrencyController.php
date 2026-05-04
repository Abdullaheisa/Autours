<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignRentalTerm;
use App\Http\Requests\CreateRentalTerms;
use App\Models\Currency;
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

class CurrencyController extends Controller
{
    /**
     * Display a listing of the resource.
     */


    public function index()
    {

        return Currency::query()->get();
    }


    public function insert(CreateRentalTerms $request)
    {
        $status =  RentalTerms::query()->insert($request->all());
        return response()->json([
            'status' => $status,
            'data' => []
        ]);
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

    public function assignRentalTerms (AssignRentalTerm $request) {
        $checkIfSelected = SupplierRentalTerm::query()->where('supplier_id', auth()->user()->id)->where('rental_term_id', $request->term_id)->get();
        if($checkIfSelected->count()) {
            $status = SupplierRentalTerm::query()->where('supplier_id', auth()->user()->id)->where('rental_term_id', $request->term_id)->delete();
        } else {
            $status = SupplierRentalTerm::query()->insert(['supplier_id' => auth()->user()->id, 'rental_term_id' => $request->term_id]);
        }
        return response()->json([
            'status' => $status,
            'data' => []
        ]);
    }
}
