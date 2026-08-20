<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Get real platform statistics for homepage & platform (Live & Dynamic)
     */
    public function index(): JsonResponse
    {
        // 30-second cache ensures real-time updates while keeping performance ultra-fast
        $stats = Cache::remember('platform_stats_live', 30, function () {
            // Active suppliers: role = active_supplier, not hidden, having active branches and active vehicles
            $activeSuppliers = User::where('role', 'active_supplier')
                ->where(function($q) {
                    $q->where('vehicles_hidden', false)->orWhereNull('vehicles_hidden');
                })
                ->whereHas('branches', function($q) {
                    $q->where('activation', 1);
                })
                ->whereHas('vehicles', function($q) {
                    $q->where('activation', 1);
                })
                ->get();

            $activeSupplierIds = $activeSuppliers->pluck('id')->toArray();
            $suppliersCount = count($activeSupplierIds);

            // Countries with active branches belonging to active suppliers
            $countriesCount = Branch::where('activation', 1)
                ->whereIn('company_id', $activeSupplierIds)
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->distinct('country')
                ->count('country');

            // Cities with active branches belonging to active suppliers
            $citiesCount = Branch::where('activation', 1)
                ->whereIn('company_id', $activeSupplierIds)
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->distinct('city')
                ->count('city');

            // Total active branches belonging to active suppliers
            $branchesCount = Branch::where('activation', 1)
                ->whereIn('company_id', $activeSupplierIds)
                ->count();

            // Total active airports
            $airportsCount = Branch::where('activation', 1)
                ->whereIn('company_id', $activeSupplierIds)
                ->where(function ($q) {
                    $q->where('location_type', 'Airport')
                      ->orWhereNotNull('airport_id')
                      ->orWhere('name', 'ilike', '%airport%')
                      ->orWhere('name', 'ilike', '%مطار%')
                      ->orWhere('city', 'ilike', '%airport%')
                      ->orWhere('adresse', 'ilike', '%airport%')
                      ->orWhere('name', 'ilike', '%terminal%');
                })
                ->distinct('name')
                ->count('name');

            // Real live active vehicles from active suppliers
            $carsCount = Vehicle::where('activation', 1)
                ->whereIn('supplier', $activeSupplierIds)
                ->count();

            return [
                'countries' => $countriesCount,
                'cities' => $citiesCount,
                'airports' => $airportsCount,
                'suppliers' => $suppliersCount,
                'branches' => $branchesCount,
                'cars' => $carsCount,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }
}
