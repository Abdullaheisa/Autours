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
            $supplierIds = null;
            $branchIds = null;
            $vehicles = null;
            if ($request->has('country')) {
                $branchIds = Branch::query()->select(['id'])->where('country', $request->country)->get()->pluck('id')->toArray();
                $vehicles = Vehicle::query()->whereIn('pickup_loc', $branchIds)->get();
            }
            if ($request->has('supplier')) {
                $supplierIds = User::query()->select(['id'])->where('id', $request->supplier)->get()->pluck('id')->toArray();
                $vehicles = Vehicle::query()->whereIn('supplier', $supplierIds)->get();

            }
            if ($request->has('branch')) {
                $vehicles = Vehicle::query()->where('pickup_loc', $request->branch)->get();
            }
            if ($request->has('selectedVehicles')) {
                $vehicles = Vehicle::query()->whereIn('id', explode(',',$request->selectedVehicles ))->get();
            }
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

            if ($request->has('supplier')) {
                $query->where('vehicles.supplier', $request->supplier);
            } else {
                $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? auth()->user();
                if ($user && $user->role == 'active_supplier') {
                    $query->where('supplier_id', $user->id);
                }
            }

            if ($request->has('branch')) {
                $query->where('pickup_loc', $request->branch);
            }

            if ($request->has('selectedVehicles')) {
                $query->whereIn('vehicles.id', $request->selectedVehicles);
            }

            $query->leftJoin('branches', 'branches.id', '=', 'vehicles.pickup_loc');

            if ($request->has('country')) {
                $query->where('branches.country', $request->country);
            }

            if ($request->has('search')) {
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
                'profits.per_day_profit',
                'profits.per_week_profit',
                'profits.per_month_profit',
                'profits.weekend_profit',
                'vehicles.photo',
                'vehicles.name as vehicle_name',
                'branches.name as branch_name',
                'branches.country as branch_country',
            ])->paginate($request->get('per_page', 15));

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
