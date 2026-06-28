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

            if ($request->filled('country')) {
                $branchIds = Branch::query()->select(['id'])->where('country', $request->country)->get()->pluck('id')->toArray();
                $query->whereIn('pickup_loc', $branchIds);
            }
            if ($request->filled('supplier')) {
                $query->where('supplier', $request->supplier);
            }
            if ($request->filled('branch')) {
                $query->where('pickup_loc', $request->branch);
            }
            if ($request->filled('category')) {
                $query->where('category', $request->category);
            }
            if ($request->filled('selectedVehicles')) {
                $query->whereIn('id', explode(',', $request->selectedVehicles));
            }
            $vehicles = $query->get();
            foreach ($vehicles as $vehicle) {
                Profit::query()->where('vehicle_id', $vehicle->id)->delete();
                $profit = new Profit();
                $profit->supplier_id = $vehicle->supplier;
                $profit->vehicle_id = $vehicle->id;
                $profit->branch_id = $vehicle->pickup_loc;
                $profit->per_day_profit = $request->priceTax;
                $profit->per_week_profit = $request->weekPriceTax;
                $profit->per_month_profit = $request->monthPriceTax;
                $profit->weekend_profit = $request->weekendPriceTax;
                $profit->save();
            }
            return response()->json([
                'data' => [],
                'message' => 'profit updated'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'data' => $e,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request)
    {
        try {
            $query = Vehicle::query()->leftJoin('profits', 'profits.vehicle_id', '=', 'vehicles.id');

            if ($request->filled('supplier')) {
                $query->where('vehicles.supplier', $request->supplier);
            } else {
                $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
                if ($user && $user->role == 'active_supplier') {
                    $query->where('vehicles.supplier', $user->id);
                }
            }

            if ($request->filled('branch')) {
                $query->where('vehicles.pickup_loc', $request->branch);
            }

            if ($request->filled('category')) {
                $query->where('vehicles.category', $request->category);
            }

            if ($request->filled('selectedVehicles')) {
                $query->whereIn('vehicles.id', (array)$request->selectedVehicles);
            }

            $query->leftJoin('branches', 'branches.id', '=', 'vehicles.pickup_loc');
            $query->leftJoin('users', 'users.id', '=', 'vehicles.supplier');

            if ($request->filled('country')) {
                $query->where('branches.country', $request->country);
            }

            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('vehicles.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.name', 'LIKE', '%' . $search . '%')
                      ->orWhere('branches.country', 'LIKE', '%' . $search . '%');
                });
            }

            if ($request->has('no_profit') && $request->no_profit === 'true') {
                $query->whereNull('profits.vehicle_id');
            }

            $query->orderBy('vehicles.id', 'desc');

            $data = $query->select([
                'vehicles.id as vehicle_id',
                'vehicles.supplier as supplier',
                'users.name as supplier_name',
                'profits.per_day_profit',
                'profits.per_week_profit',
                'profits.per_month_profit',
                'profits.weekend_profit',
                'vehicles.photo',
                'vehicles.name as vehicle_name',
                'branches.name as branch_name',
                'branches.country as branch_country',
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
