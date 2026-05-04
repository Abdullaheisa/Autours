<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Included;
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
use PharIo\Manifest\Exception;

class IncludedController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function index()
    {
        return Included::all();
    }

    public function store(Request $request)
    {
        $status = Included::query()->insert(['what_is_included' => $request->included]);
        return response()->json([
            'data' => [],
            'status' => $status
        ]);
    }

    public function delete(Request $request)
    {
        $status = Included::query()->find($request->id)->delete();
        return response()->json([
            'data' => [],
            'status' => $status
        ]);
    }

}
