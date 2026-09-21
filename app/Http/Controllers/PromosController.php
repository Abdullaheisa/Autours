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
            $selectedIds = collect($rawIds)
                ->map(fn ($id) => (int) trim((string) $id))
                ->filter(fn ($id) => $id > 0)
                ->unique()->values()->all();

            if (!$includedId) {
                return response()->json(['status' => false, 'message' => 'Promo is required.'], 422);
            }
            if (empty($selectedIds)) {
                return response()->json(['status' => false, 'message' => 'Select at least one vehicle.'], 422);
            }

            // The company page may load vehicles through the external endpoint,
            // which can still use the original bearer user after changeCompany.
            // Resolve the final vehicle set against the active session company.
            $activeVehicleIds = Vehicle::where('supplier', $user->id)
                ->whereIn('id', $selectedIds)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()->all();

            // If all submitted IDs belong to the old token company, use the
            // active company's fleet. This makes Select All work after switching
            // companies without assigning a promo to another supplier's cars.
            if (empty($activeVehicleIds)) {
                $activeVehicleIds = Vehicle::where('supplier', $user->id)
                    ->pluck('id')
                    ->map(fn ($id) => (int) $id)
                    ->values()->all();
            }

            if (empty($activeVehicleIds)) {
                return response()->json(['status' => false, 'message' => 'No vehicles found for the active company.'], 422);
            }

            DB::transaction(function () use ($user, $includedId, $activeVehicleIds) {
                if ($user->role === 'admin') {
                    $existing = Promo::where('included_id', $includedId)
                        ->pluck('vehicle_id')->map(fn ($id) => (int) $id)->all();
                    $toDelete = array_diff($existing, $activeVehicleIds);
                    if ($toDelete) {
                        Promo::where('included_id', $includedId)
                            ->whereIn('vehicle_id', $toDelete)->delete();
                    }
                    foreach ($activeVehicleIds as $vehicleId) {
                        if (in_array($vehicleId, $existing, true)) continue;
                        $vehicle = Vehicle::find($vehicleId);
                        if ($vehicle) {
                            Promo::create([
                                'included_id' => $includedId,
                                'vehicle_id' => $vehicleId,
                                'supplier_id' => $vehicle->supplier,
                            ]);
                        }
                    }
                    return;
                }

                Promo::where('supplier_id', $user->id)->delete();
                foreach ($activeVehicleIds as $vehicleId) {
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
