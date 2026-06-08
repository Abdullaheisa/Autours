<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Included;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class IncludedController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Guests/Customers, Suppliers, and Admins see standard inclusions (is_promo = 0)
        return Included::where('is_promo', 0)->get();
    }

    public function store(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Standard inclusions can only be managed by administrators.'
            ], StatusCodes::FORBIDDEN);
        }

        $included = new Included();
        $included->what_is_included = $request->included;
        
        if ($request->has('description')) {
            $included->description = $request->description;
        }

        $included->is_promo = 0;
        $included->supplier_id = null;
        $included->status = 'approved';

        $status = $included->save();

        return response()->json([
            'data' => $included,
            'status' => $status,
            'message' => 'Standard inclusion created successfully.'
        ]);
    }

    public function delete(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized.'
            ], StatusCodes::FORBIDDEN);
        }

        $included = Included::query()->where('is_promo', 0)->find($request->id);

        if (!$included) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }

        $status = $included->delete();
        return response()->json([
            'data' => [],
            'status' => $status,
            'message' => 'Standard inclusion deleted successfully.'
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();

        if (!$user || $user->role !== 'admin') {
            return response()->json(['status' => false, 'message' => 'Unauthorized'], StatusCodes::FORBIDDEN);
        }

        $included = Included::query()->where('is_promo', 0)->find($request->id);
        if (!$included) {
            return response()->json(['status' => false, 'message' => 'Not found'], 404);
        }

        $included->what_is_included = $request->included;
        if ($request->has('description')) {
            $included->description = $request->description;
        }
        $status = $included->save();

        return response()->json([
            'data' => $included,
            'status' => $status,
            'message' => 'Standard inclusion updated successfully.'
        ]);
    }
}
