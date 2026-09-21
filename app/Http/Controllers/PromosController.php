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
     * The company dashboard can switch the active company in the web session
     * while the original Sanctum token remains unchanged. Prefer the session
     * user here so promo assignments are always saved for the company being
     * viewed, not for the user who issued the token.
     */
    private function currentUser()
    {
        return Auth::user() ?? Auth::guard('sanctum')->user();
    }

    public function index(Request $request)
    {
        $user = $this->currentUser();
        if (!$user) return response()->json([]);

        if ($request->has('included_id')) {
            $query = Promo::where('included_id', (int) $request->query('included_id'));
            if ($user->role !== 'admin') {
                $query->where('supplier_id', $user->id);
            } elseif ($request->has('supplier_id')) {
                $query->where('supplier_id', $request->query('supplier_id'));
            }
            return $query->pluck('vehicle_id')->map(fn ($id) => (int) $id)->values();
        }

        $query = Promo::query();
        if ($user->role !== 'admin') $query->where('supplier_id', $user->id);
        return $query->pluck('included_id')->map(fn ($id) => (int) $id)->unique()->values();
    }

    public function store(Request $request)
    {
        try {
            $user = $this->currentUser();
            if (!$user) return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);

            $includedId = (int) $request->input('included_id');
            $input = $request->input('selected_vehicles', []);
            $rawIds = is_array($input) ? $input : explode(',', (string) $input);
            $newVehicleIds = collect($rawIds)
                ->map(fn ($id) => (int) trim((string) $id))
                ->filter(fn ($id) => $id > 0)
                ->unique()->values()->all();

            if (!$includedId) {
                return response()->json(['status' => false, 'message' => 'Promo is required.'], 422);
            }
            if (empty($newVehicleIds)) {
                return response()->json(['status' => false, 'message' => 'Select at least one vehicle.'], 422);
            }

            $vehicleQuery = Vehicle::whereIn('id', $newVehicleIds);
            if ($user->role !== 'admin') $vehicleQuery->where('supplier', $user->id);
            $validIds = $vehicleQuery->pluck('id')->map(fn ($id) => (int) $id)->unique()->values()->all();

            if (count($validIds) !== count($newVehicleIds)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Selected vehicles do not belong to the active company.',
                    'selected_vehicle_ids' => $newVehicleIds,
                    'valid_vehicle_ids' => $validIds,
                ], 422);
            }

            DB::transaction(function () use ($user, $includedId, $validIds) {
                if ($user->role === 'admin') {
                    $existing = Promo::where('included_id', $includedId)->pluck('vehicle_id')->map(fn ($id) => (int) $id)->all();
                    Promo::where('included_id', $includedId)->whereIn('vehicle_id', array_diff($existing, $validIds))->delete();
                    foreach ($validIds as $vehicleId) {
                        if (in_array($vehicleId, $existing, true)) continue;
                        $vehicle = Vehicle::find($vehicleId);
                        if ($vehicle) Promo::create([
                            'included_id' => $includedId,
                            'vehicle_id' => $vehicleId,
                            'supplier_id' => $vehicle->supplier,
                        ]);
                    }
                    return;
                }

                Promo::where('supplier_id', $user->id)->delete();
                foreach ($validIds as $vehicleId) {
                    Promo::create([
                        'included_id' => $includedId,
                        'vehicle_id' => $vehicleId,
                        'supplier_id' => $user->id,
                    ]);
                }
            });

            return response()->json(['status' => true]);
        } catch (\Throwable $exception) {
            Log::error('PromosController@store error', ['message' => $exception->getMessage()]);
            return response()->json(['status' => false, 'message' => 'Failed to update promo.'], StatusCodes::SERVER_ERROR);
        }
    }

    public function destroy($id)
    {
        $user = $this->currentUser();
        if (!$user) return response()->json(['error' => 'Unauthenticated'], StatusCodes::UNAUTHORIZED);
        $query = Promo::where('included_id', (int) $id);
        if ($user->role !== 'admin') $query->where('supplier_id', $user->id);
        $query->delete();
        return response()->json(['status' => true]);
    }

    public function getDefinitions(Request $request)
    {
        $user = $this->currentUser();
        if (!$user) return response()->json([]);
        if ($user->role === 'admin') return Included::where('is_promo', 1)->with('supplier')->get();
        if (in_array($user->role, ['supplier', 'active_supplier'], true)) {
            return Included::where('is_promo', 1)->where(function ($q) use ($user) {
                $q->where(function ($q2) {
                    $q2->whereNull('supplier_id')->where('status', 'approved');
                })->orWhere('supplier_id', $user->id);
            })->get();
        }
        return Included::where('is_promo', 1)->where('status', 'approved')->get();
    }
}
