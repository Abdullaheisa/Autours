<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Promo;
use App\Models\Included;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromosController extends Controller
{
    /**
     * Get active promos for vehicles
     */
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) return response()->json([]);

        if ($request->has('included_id')) {
            $query = Promo::query()->where('included_id', (int) $request->query('included_id'));

            if ($user->role !== 'admin') {
                $query->where('supplier_id', $user->id);
            } elseif ($request->has('supplier_id')) {
                $query->where('supplier_id', $request->query('supplier_id'));
            }

            return $query->pluck('vehicle_id')->map(fn ($id) => (int) $id)->values();
        }

        $query = Promo::query();
        if ($user->role !== 'admin') {
            $query->where('supplier_id', $user->id);
        }
        return $query->pluck('included_id')->unique()->values();
    }

    /**
     * Assign promo to vehicles
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user() ?? Auth::user();
            if (!$user) {
                return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
            }

            $includedId = (int) $request->input('included_id');
            $selectedVehicles = $request->input('selected_vehicles', '');
            $rawIds = is_array($selectedVehicles) ? $selectedVehicles : explode(',', (string) $selectedVehicles);

            $newVehicleIds = collect($rawIds)
                ->map(fn ($id) => (int) trim((string) $id))
                ->filter(fn ($id) => $id > 0)
                ->unique()
                ->values()
                ->all();

            if (!$includedId) {
                return response()->json(['status' => false, 'message' => 'Promo is required.'], 422);
            }

            $vehicleQuery = Vehicle::query()->whereIn('id', $newVehicleIds);
            if ($user->role !== 'admin') {
                $vehicleQuery->where('supplier', $user->id);
            }

            $validVehicleIds = $vehicleQuery
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->all();

            if (count($validVehicleIds) !== count($newVehicleIds)) {
                return response()->json([
                    'status' => false,
                    'message' => 'One or more selected vehicles are invalid or do not belong to this supplier.',
                    'selected_vehicle_ids' => $newVehicleIds,
                    'valid_vehicle_ids' => $validVehicleIds,
                ], 422);
            }

            DB::transaction(function () use ($user, $includedId, $validVehicleIds) {
                if ($user->role === 'admin') {
                    $existingVehicleIds = Promo::where('included_id', $includedId)
                        ->pluck('vehicle_id')
                        ->map(fn ($id) => (int) $id)
                        ->toArray();

                    $toDelete = array_diff($existingVehicleIds, $validVehicleIds);
                    if (!empty($toDelete)) {
                        Promo::where('included_id', $includedId)
                            ->whereIn('vehicle_id', $toDelete)
                            ->delete();
                    }

                    foreach ($validVehicleIds as $vehicleId) {
                        if (in_array($vehicleId, $existingVehicleIds, true)) {
                            continue;
                        }

                        $vehicle = Vehicle::find($vehicleId);
                        if (!$vehicle) {
                            continue;
                        }

                        Promo::create([
                            'included_id' => $includedId,
                            'vehicle_id' => $vehicleId,
                            'supplier_id' => $vehicle->supplier,
                        ]);
                    }
                    return;
                }

                Promo::where('supplier_id', $user->id)->delete();

                foreach ($validVehicleIds as $vehicleId) {
                    Promo::create([
                        'included_id' => $includedId,
                        'vehicle_id' => $vehicleId,
                        'supplier_id' => $user->id,
                    ]);
                }
            });

            return response()->json(['status' => true]);
        } catch (\Throwable $exception) {
            Log::error('PromosController@store error', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to update promo.'
            ], StatusCodes::SERVER_ERROR);
        }
    }

    /**
     * Delete active promo assignments for a given included_id
     */
    public function destroy($id)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
        }

        $query = Promo::query()->where('included_id', (int) $id);
        if ($user->role !== 'admin') {
            $query->where('supplier_id', $user->id);
        }

        $query->delete();
        return response()->json(['status' => true]);
    }

    // ==========================================
    // Promo Definitions (included table where is_promo = 1)
    // ==========================================

    public function getDefinitions(Request $request)
    {
        $user = Auth::guard('sanctum')->user() ?? Auth::user();
        if (!$user) return response()->json([]);

        if ($user->role === 'admin') {
            return Included::where('is_promo', 1)->with('supplier')->get();
        }

        if (in_array($user->role, ['supplier', 'active_supplier'])) {
            return Included::where('is_promo', 1)
                ->where(function ($query) use ($user) {
                    $query->where(function ($q) {
                        $q->whereNull('supplier_id')->where('status', 'approved');
                    })->orWhere('supplier_id', $user->id);
                })->get();
        }

        return Included::where('is_promo', 1)->where('status', 'approved')->get();
    }
}
