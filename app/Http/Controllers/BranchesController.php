<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
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

class BranchesController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index(Request $request)
    {

        return Branch::query()->where('company_id', Auth::id())->get();

    }

    public function edit()
    {
        try {
            return Inertia::render('Dashboard/Branches/Edit');
        } catch (\Exception $e) {
            info($e->getMessage());
            return response()->json([
                'error' => 'Not Found'
            ], 404);
        }
    }

    public function show($id)
    {
        try {
            $branch = Branch::query()->find($id);
            $ad = explode(',',$branch->location);
            if(count($ad) > 0 ) {
                if($branch->location_type == 'Airport')
                $branch->abriviation = $ad[count($ad) - 1];
                else
                    $branch->abriviation = null;
            }
            return response()->json([
                'data' => $branch
            ]);
        } catch (\Exception $e) {
            info($e->getMessage());
            return response()->json([
                'error' => 'Not Found'
            ], 404);
        }
    }

    public function store(Request $request)
    {

    }

    public function update(Request $request)
    {

        try {
            $branch = Branch::query()->find( $request->id);
            $branch->name = $request->name;
            $branch->location = $request->location;
            $branch->adresse = $request->adresse;
            $branch->email = $request->email;
            $branch->phone = $request->phone;
            $branch->country = $request->country;
            $branch->city = $request->city;
            $branch->currency = $request->currency;
            $branch->location_type = $request->pickup_type;
            $branch->lat = $request->lat;
            $branch->lng = $request->lng;
            $branch->save();
            return response()->json([
                'data' => $branch,
                'status' => true,
                'message' => 'branch updated successfully'
            ]);
        } catch (\Exception $e) {
            info($e->getMessage());
            return response()->json([
                'error' => 'something went wrong'
            ], StatusCodes::SERVER_ERROR);
        }

    }


}
