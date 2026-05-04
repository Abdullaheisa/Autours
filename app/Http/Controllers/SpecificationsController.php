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

class SpecificationsController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {

        return response()->json(Specification::query()->orderBy('name')->get());

    }
    public function update(Request $request)
    {
        $item =  Specification::query()->find($request->id);

        if ($request->has('name')) {
            $item->name = $request->name;
        }
        if ($request->has('icon')) {
            $item->icon = $request->icon;
        }
        if ($request->has('options')) {
            $item->options = json_decode($request->options);
        }

        $item->save();

        return response()->json(['message' => 'Added successfully']);

    }

    public function create(Request $request): \Illuminate\Http\JsonResponse
    {
        $item = new Specification();

        if ($request->has('name')) {
            $item->name = $request->name;
        }
        if ($request->has('icon')) {
            $item->icon = $request->icon;
        }
        if ($request->has('options')) {
            $item->options = json_decode($request->options);
        }

        $item->save();

        return response()->json(['message' => 'Added successfully']);
    }

    public function destroy(Request $request)
    {
        Specification::where('id', $request->id)->delete();

        return $this->getSpecifications();

    }

}
