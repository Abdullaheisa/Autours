<?php

namespace App\Http\Controllers;

use App\Models\Included;
use App\Models\Vehicle;
use App\Models\VehicleIncluded;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VehicleInclusionsController extends Controller
{
    /**
     * List vehicles with their current "What's Included" items.
     * Supports the same cascading filters as ProfitsController::show().
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Vehicle::query()
                ->leftJoin('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                ->leftJoin('users', 'users.id', '=', 'vehicles.supplier');

            if ($request->has('supplier')) {
                $query->where('vehicles.supplier', $request->supplier);
            }

            if ($request->has('branch')) {
                $query->where('vehicles.pickup_loc', $request->branch);
            }

            if ($request->has('selectedVehicles')) {
                $query->whereIn('vehicles.id', $request->selectedVehicles);
            }

            if ($request->has('country')) {
                $query->where('branches.country', $request->country);
            }

            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('vehicles.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.country', 'LIKE', '%' . $search . '%')
                      ->orWhere('users.name', 'LIKE', '%' . $search . '%');
                });
            }

            if ($request->has('no_inclusions') && $request->no_inclusions === 'true') {
                $query->whereNotExists(function ($sub) {
                    $sub->select(DB::raw(1))
                        ->from('vehicle_included')
                        ->whereColumn('vehicle_included.vehicle_id', 'vehicles.id');
                });
            }

            $query->whereNull('vehicles.deleted_at');
            $query->orderBy('vehicles.id', 'desc');

            $data = $query->select([
                'vehicles.id as vehicle_id',
                'vehicles.name as vehicle_name',
                'vehicles.photo',
                'vehicles.supplier as supplier_id',
                'users.name as supplier_name',
                'branches.name as branch_name',
                'branches.country as branch_country',
            ])->paginate($request->get('per_page', 12));

            // Attach included items for each vehicle in the current page
            $vehicleIds = collect($data->items())->pluck('vehicle_id')->toArray();

            $inclusions = DB::table('vehicle_included')
                ->join('included', 'included.id', '=', 'vehicle_included.included_id')
                ->whereIn('vehicle_included.vehicle_id', $vehicleIds)
                ->select([
                    'vehicle_included.vehicle_id',
                    'included.id as included_id',
                    'included.what_is_included',
                ])
                ->get()
                ->groupBy('vehicle_id');

            $items = $data->toArray();
            foreach ($items['data'] as &$vehicle) {
                $vid = $vehicle['vehicle_id'];
                $vehicle['included'] = isset($inclusions[$vid])
                    ? $inclusions[$vid]->map(fn ($i) => [
                        'id' => $i->included_id,
                        'name' => $i->what_is_included,
                    ])->values()->toArray()
                    : [];
            }
            unset($vehicle);

            // Compute server-side aggregate stats across ALL filtered vehicles (not just the page)
            $totalVehicles = $items['total'];
            $withInclusionsCount = DB::table('vehicle_included')
                ->join('vehicles', 'vehicles.id', '=', 'vehicle_included.vehicle_id')
                ->whereNull('vehicles.deleted_at')
                ->distinct('vehicle_included.vehicle_id')
                ->count('vehicle_included.vehicle_id');
            $totalBranches = Vehicle::whereNull('deleted_at')
                ->distinct('pickup_loc')
                ->count('pickup_loc');

            // If there are active filters, compute against the filtered set instead
            if ($request->has('country') || $request->has('supplier') || $request->has('branch')
                || $request->has('selectedVehicles') || $request->has('search')) {
                // Clone query without pagination to get all matching vehicle IDs
                $filteredQuery = Vehicle::query()
                    ->leftJoin('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                    ->leftJoin('users', 'users.id', '=', 'vehicles.supplier')
                    ->whereNull('vehicles.deleted_at');

                if ($request->has('supplier')) {
                    $filteredQuery->where('vehicles.supplier', $request->supplier);
                }
                if ($request->has('branch')) {
                    $filteredQuery->where('vehicles.pickup_loc', $request->branch);
                }
                if ($request->has('selectedVehicles')) {
                    $filteredQuery->whereIn('vehicles.id', $request->selectedVehicles);
                }
                if ($request->has('country')) {
                    $filteredQuery->where('branches.country', $request->country);
                }
                if ($request->has('search')) {
                    $search = $request->get('search');
                    $filteredQuery->where(function ($q) use ($search) {
                        $q->where('vehicles.name', 'LIKE', '%' . $search . '%')
                          ->orWhere('branches.name', 'LIKE', '%' . $search . '%')
                          ->orWhere('branches.country', 'LIKE', '%' . $search . '%')
                          ->orWhere('users.name', 'LIKE', '%' . $search . '%');
                    });
                }

                $allFilteredIds = $filteredQuery->pluck('vehicles.id')->toArray();
                $withInclusionsCount = DB::table('vehicle_included')
                    ->whereIn('vehicle_id', $allFilteredIds)
                    ->distinct('vehicle_id')
                    ->count('vehicle_id');
                $totalVehicles = count($allFilteredIds);
                $totalBranches = Vehicle::whereNull('deleted_at')
                    ->whereIn('id', $allFilteredIds)
                    ->distinct('pickup_loc')
                    ->count('pickup_loc');
            }

            $items['with_inclusions_count'] = $withInclusionsCount;
            $items['without_inclusions_count'] = $totalVehicles - $withInclusionsCount;
            $items['total_branches'] = $totalBranches;

            return response()->json($items, 200);
        } catch (\Exception $e) {
            Log::error("VehicleInclusionsController index error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to load vehicle inclusions.',
            ], 500);
        }
    }

    /**
     * Bulk update "What's Included" for multiple vehicles.
     * Replaces existing inclusions with the new set.
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'selectedVehicles' => 'required|string',
                'included_ids' => 'required|array',
                'included_ids.*' => 'integer|exists:included,id',
            ]);

            $vehicleIds = array_filter(
                array_map('intval', explode(',', $request->selectedVehicles))
            );

            if (empty($vehicleIds)) {
                return response()->json(['message' => 'No vehicles selected.'], 422);
            }

            $includedIds = array_map('intval', $request->included_ids);

            DB::beginTransaction();

            // Delete existing inclusions for all selected vehicles
            VehicleIncluded::whereIn('vehicle_id', $vehicleIds)->delete();

            // Insert new inclusions
            $rows = [];
            $now = now();
            foreach ($vehicleIds as $vehicleId) {
                foreach ($includedIds as $includedId) {
                    $rows[] = [
                        'vehicle_id' => $vehicleId,
                        'included_id' => $includedId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (!empty($rows)) {
                // Insert in chunks to avoid MySQL packet limits
                foreach (array_chunk($rows, 500) as $chunk) {
                    VehicleIncluded::insert($chunk);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Inclusions updated for ' . count($vehicleIds) . ' vehicles.',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("VehicleInclusionsController bulkUpdate error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'message' => 'Failed to update inclusions.',
            ], 500);
        }
    }

    /**
     * Update inclusions for a single vehicle (per-row edit).
     */
    public function updateSingle(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'vehicle_id' => 'required|integer|exists:vehicles,id',
                'included_ids' => 'required|array',
                'included_ids.*' => 'integer|exists:included,id',
            ]);

            $vehicleId = (int) $request->vehicle_id;
            $includedIds = array_map('intval', $request->included_ids);

            DB::beginTransaction();

            VehicleIncluded::where('vehicle_id', $vehicleId)->delete();

            $now = now();
            $rows = array_map(fn ($id) => [
                'vehicle_id' => $vehicleId,
                'included_id' => $id,
                'created_at' => $now,
                'updated_at' => $now,
            ], $includedIds);

            if (!empty($rows)) {
                VehicleIncluded::insert($rows);
            }

            DB::commit();

            return response()->json([
                'message' => 'Vehicle inclusions updated.',
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("VehicleInclusionsController updateSingle error: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update vehicle inclusions.',
            ], 500);
        }
    }
}
