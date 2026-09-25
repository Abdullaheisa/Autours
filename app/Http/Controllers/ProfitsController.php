<?php

namespace App\Http\Controllers;

use App\Enums\StatusCodes;
use App\Models\Profit;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Branch;

class ProfitsController extends Controller
{
    public function upload(Request $request)
    {
        try {
            $query = Vehicle::query();

            if ($request->filled('country') && $request->country !== 'All') {
                $country = trim($request->country);
                $branchIds = Branch::query()
                    ->select(['id'])
                    ->where(function ($q) use ($country) {
                        $q->where('country', $country)
                          ->orWhere('country', 'ILIKE', $country);
                    })
                    ->pluck('id')
                    ->toArray();
                $query->whereIn('pickup_loc', $branchIds);
            }

            if ($request->filled('supplier') && $request->supplier !== 'All') {
                $query->where('supplier', $request->supplier);
            } else if ($request->filled('supplier_status') && $request->supplier_status !== 'all') {
                $status = $request->supplier_status;
                $query->whereHas('supplierUser', function ($q) use ($status) {
                    if ($status === 'active') {
                        $q->where('role', 'active_supplier')
                          ->where(function ($sq) {
                              $sq->whereNull('vehicles_hidden')->orWhere('vehicles_hidden', false);
                          });
                    } else if ($status === 'inactive') {
                        $q->where('role', '!=', 'active_supplier')
                          ->orWhere('vehicles_hidden', true);
                    }
                });
            }

            if ($request->filled('branch') && $request->branch !== 'All') {
                $query->where('pickup_loc', $request->branch);
            }

            if ($request->filled('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'ILIKE', "%{$search}%")
                      ->orWhereHas('branch', function ($bq) use ($search) {
                          $bq->where('name', 'ILIKE', "%{$search}%")
                             ->orWhere('country', 'ILIKE', "%{$search}%");
                      })
                      ->orWhereHas('supplierUser', function ($sq) use ($search) {
                          $sq->where('name', 'ILIKE', "%{$search}%")
                             ->orWhere('company', 'ILIKE', "%{$search}%");
                      });
                });
            }

            if ($request->filled('selectedVehicles')) {
                $ids = is_array($request->selectedVehicles) ? $request->selectedVehicles : explode(',', $request->selectedVehicles);
                $cleanIds = array_filter($ids);
                if (!empty($cleanIds)) {
                    $query->whereIn('id', $cleanIds);
                }
            }

            $updateData = [];
            if ($request->has('priceTax') && $request->priceTax !== null && $request->priceTax !== '') {
                $updateData['per_day_profit'] = floatval($request->priceTax);
            }
            if ($request->has('weekPriceTax') && $request->weekPriceTax !== null && $request->weekPriceTax !== '') {
                $updateData['per_week_profit'] = floatval($request->weekPriceTax);
            }
            if ($request->has('monthPriceTax') && $request->monthPriceTax !== null && $request->monthPriceTax !== '') {
                $updateData['per_month_profit'] = floatval($request->monthPriceTax);
            }
            if ($request->has('weekendPriceTax') && $request->weekendPriceTax !== null && $request->weekendPriceTax !== '') {
                $updateData['weekend_profit'] = floatval($request->weekendPriceTax);
            }
            if ($request->has('discount_percent') && $request->discount_percent !== null && $request->discount_percent !== '') {
                $updateData['discount_percent'] = floatval($request->discount_percent);
            } else if ($request->has('discount') && $request->discount !== null && $request->discount !== '') {
                $updateData['discount_percent'] = floatval($request->discount);
            }

            if (empty($updateData)) {
                return response()->json([
                    'data' => [],
                    'message' => 'No values to update',
                    'count' => 0
                ], 200);
            }

            $vehicles = $query->select(['id', 'supplier', 'pickup_loc'])->get();
            if ($vehicles->isEmpty()) {
                return response()->json([
                    'data' => [],
                    'message' => 'No vehicles found to update',
                    'count' => 0
                ], 200);
            }

            $vehicleIds = $vehicles->pluck('id')->toArray();
            $now = now();
            $updateDataWithTimestamp = array_merge($updateData, ['updated_at' => $now]);

            // Bulk update existing profits in chunks
            foreach (array_chunk($vehicleIds, 1000) as $chunkIds) {
                Profit::whereIn('vehicle_id', $chunkIds)->update($updateDataWithTimestamp);
            }

            // Find missing vehicles that don't have profit rows
            $existingVehicleIds = [];
            foreach (array_chunk($vehicleIds, 1000) as $chunkIds) {
                $existingChunk = Profit::whereIn('vehicle_id', $chunkIds)->pluck('vehicle_id')->toArray();
                $existingVehicleIds = array_merge($existingVehicleIds, $existingChunk);
            }
            $existingMap = array_flip($existingVehicleIds);
            $missingVehicles = $vehicles->filter(fn($v) => !isset($existingMap[$v->id]));

            if ($missingVehicles->isNotEmpty()) {
                $rowsToInsert = [];
                foreach ($missingVehicles as $v) {
                    $rowsToInsert[] = array_merge([
                        'supplier_id' => $v->supplier,
                        'branch_id' => $v->pickup_loc,
                        'vehicle_id' => $v->id,
                        'per_day_profit' => 0,
                        'per_week_profit' => 0,
                        'per_month_profit' => 0,
                        'weekend_profit' => 0,
                        'discount_percent' => 0,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ], $updateData);
                }
                foreach (array_chunk($rowsToInsert, 500) as $chunk) {
                    Profit::insert($chunk);
                }
            }

            return response()->json([
                'data' => [],
                'message' => 'Profit updated successfully',
                'count' => count($vehicleIds)
            ], 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("ProfitsController upload error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'data' => $e->getMessage(),
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request)
    {
        try {
            $query = Vehicle::query()
                ->leftJoin('profits', 'profits.vehicle_id', '=', 'vehicles.id')
                ->leftJoin('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                ->leftJoin('users', 'users.id', '=', 'vehicles.supplier');

            // Supplier status filter: 'active' (default), 'inactive', or 'all'
            $supplierStatus = $request->get('supplier_status', 'active');

            if ($request->filled('supplier') && $request->supplier !== 'All') {
                $query->where('vehicles.supplier', $request->supplier);
            } else {
                $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
                if ($user && $user->role == 'active_supplier') {
                    $query->where('vehicles.supplier', $user->id);
                } else {
                    if ($supplierStatus === 'active') {
                        $query->where('users.role', 'active_supplier')
                              ->where(function($q) {
                                  $q->whereNull('users.vehicles_hidden')
                                    ->orWhere('users.vehicles_hidden', false);
                              });
                    } else if ($supplierStatus === 'inactive') {
                        $query->where(function($q) {
                            $q->where('users.role', '!=', 'active_supplier')
                              ->orWhere('users.vehicles_hidden', true);
                        });
                    }
                    // if 'all', do not filter by user role
                }
            }

            if ($request->filled('country') && $request->country !== 'All') {
                $query->where('branches.country', $request->country);
            }

            if ($request->filled('branch') && $request->branch !== 'All') {
                $query->where('vehicles.pickup_loc', $request->branch);
            }

            if ($request->filled('category') && $request->category !== 'All') {
                $query->where('vehicles.category', $request->category);
            }

            if ($request->filled('selectedVehicles')) {
                $ids = is_array($request->selectedVehicles) ? $request->selectedVehicles : explode(',', $request->selectedVehicles);
                $query->whereIn('vehicles.id', array_filter($ids));
            }

            if ($request->filled('search')) {
                $search = trim($request->get('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('vehicles.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.country', 'LIKE', '%' . $search . '%')
                      ->orWhere('users.name', 'LIKE', '%' . $search . '%');
                });
            }

            if ($request->has('no_profit') && ($request->no_profit === 'true' || $request->no_profit === true || $request->no_profit === 1 || $request->no_profit === '1')) {
                $query->whereNull('profits.vehicle_id');
            }

            $query->orderBy('vehicles.id', 'desc');

            $data = $query->select([
                'vehicles.id as vehicle_id',
                'vehicles.supplier as supplier',
                'users.name as supplier_name',
                'vehicles.price as base_price',
                'vehicles.week_price as base_week_price',
                'vehicles.month_price as base_month_price',
                'profits.per_day_profit',
                'profits.per_week_profit',
                'profits.per_month_profit',
                'profits.weekend_profit',
                'profits.discount_percent',
                'vehicles.photo',
                'vehicles.name as vehicle_name',
                'branches.name as branch_name',
                'branches.country as branch_country',
                'branches.currency as currency',
            ])->paginate($request->get('per_page', 12));

            return response()->json($data, 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("ProfitsController show error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'data' => $e->getMessage(),
                'message' => 'there is an error: ' . $e->getMessage()
            ], StatusCodes::SERVER_ERROR);
        }
    }
}
