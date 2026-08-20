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
use App\Services\BranchNormalizationService;
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
            if (empty($branch->abriviation)) {
                $ad = explode(',', $branch->location);
                if (count($ad) > 0) {
                    if ($branch->location_type == 'Airport')
                        $branch->abriviation = trim($ad[count($ad) - 1]);
                    else
                        $branch->abriviation = null;
                }
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
            $branch = Branch::query()->find($request->id);
            if (!$branch) {
                return response()->json([
                    'status' => false,
                    'message' => 'Branch not found'
                ], 404);
            }

            // Support partial updates, like activation toggle
            if ($request->has('activation')) {
                $branch->activation = $request->boolean('activation');
            }

            if ($request->has('name')) $branch->name = $request->name;
            if ($request->has('location')) $branch->location = $request->location;
            if ($request->has('adresse')) $branch->adresse = $request->adresse;
            if ($request->has('email')) $branch->email = $request->email;
            if ($request->has('phone')) $branch->phone = $request->phone;
            if ($request->has('country')) $branch->country = $request->country;
            if ($request->has('city')) $branch->city = $request->city;
            if ($request->has('currency')) $branch->currency = $request->currency;
            if ($request->has('pickup_type')) $branch->location_type = $request->pickup_type;
            if ($request->has('location_type')) $branch->location_type = $request->location_type;
            if ($request->has('lat')) $branch->lat = $request->lat;
            if ($request->has('lng')) $branch->lng = $request->lng;
            if ($request->has('abriviation')) $branch->abriviation = $request->abriviation;
            
            $branch->save();

            // Normalize branch name/location against canonical airports
            $normalizer = new BranchNormalizationService();
            $normData = $normalizer->normalize(
                $branch->name,
                $branch->city ?? '',
                $branch->country ?? '',
                $branch->station_id,
                $branch->abriviation
            );
            $branch->update($normData);

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
