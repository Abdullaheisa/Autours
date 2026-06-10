<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Http\Request;

class SupplierIntelligenceController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::with(['supplierUser', 'vehicle_category', 'fuelPolicy', 'branches', 'vehiclePhoto']);

        // Filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhereHas('supplierUser', function($sq) use ($search) {
                      $sq->where('first_name', 'ilike', "%{$search}%")
                         ->orWhere('last_name', 'ilike', "%{$search}%");
                  });
            });
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('vehicle_category', function($q) use ($request) {
                $q->where('name', 'ilike', $request->category);
            });
        }

        if ($request->filled('carType') && $request->carType !== 'All') {
            $query->whereHas('fuelPolicy', function($q) use ($request) {
                $q->where('name', 'ilike', $request->carType);
            });
        }

        if ($request->filled('country') && $request->country !== 'All') {
            $country = $request->country;
            $countryNames = (strtoupper($country) === 'UAE') 
                ? ['UAE', 'United Arab Emirates', 'UNITED ARAB EMIRATES', 'AE'] 
                : [$country];

            $query->where(function($q) use ($countryNames) {
                $q->whereHas('branch', function($bq) use ($countryNames) {
                    $bq->where(function($qq) use ($countryNames) {
                        foreach($countryNames as $cn) {
                            $qq->orWhere('country', 'ilike', "%{$cn}%");
                        }
                    });
                })->orWhereHas('branches', function($bq) use ($countryNames) {
                    $bq->where(function($qq) use ($countryNames) {
                        foreach($countryNames as $cn) {
                            $qq->orWhere('country', 'ilike', "%{$cn}%");
                        }
                    });
                });
            });
        }

        if ($request->filled('city') && $request->city !== 'All') {
            $query->where(function($q) use ($request) {
                $q->whereHas('branch', function($bq) use ($request) {
                    $bq->where('city', 'ilike', "%{$request->city}%");
                })->orWhereHas('branches', function($bq) use ($request) {
                    $bq->where('city', 'ilike', "%{$request->city}%");
                });
            });
        }

        $perPage = $request->get('per_page', 20);
        $vehicles = $query->paginate($perPage);

        // Calculate dynamic stats
        $statsQuery = clone $query;
        $statsQuery->setEagerLoads([]);
        
        $aggregate = $statsQuery->selectRaw('
            MIN(price) as min_price, 
            MAX(price) as max_price, 
            AVG(price) as avg_price,
            COUNT(id) as total_cars
        ')->first();

        $minPrice = $aggregate->min_price ?? 0;
        $maxPrice = $aggregate->max_price ?? 0;
        $avgPrice = $aggregate->avg_price ?? 0;
        $totalCars = $aggregate->total_cars ?? 0;

        $cheapestCar = (clone $query)->orderBy('price', 'asc')->first();
        $expensiveCar = (clone $query)->orderBy('price', 'desc')->first();

        $getSupplierName = function($car) {
            if (!$car || !$car->supplierUser) return 'N/A';
            return $car->supplierUser->company ?: $car->supplierUser->name ?: 'Unknown';
        };

        $cheapestSupplierName = $getSupplierName($cheapestCar);
        $expensiveSupplierName = $getSupplierName($expensiveCar);
        
        // Distinct supplier count for filtered vehicles
        $totalSuppliers = clone $query;
        $totalSuppliers->setEagerLoads([]);
        $totalSuppliersCount = $totalSuppliers->distinct('supplier')->count('supplier');

        $stats = [
            'lowestPrice' => round($minPrice),
            'highestPrice' => round($maxPrice),
            'averagePrice' => round($avgPrice),
            'cheapestSupplier' => $cheapestSupplierName,
            'expensiveSupplier' => $expensiveSupplierName,
            'totalSuppliers' => $totalSuppliersCount,
            'totalCars' => $totalCars
        ];

        $data = $vehicles->map(function($vehicle) use ($getSupplierName) {
            $supplierName = $getSupplierName($vehicle);
            $categoryName = $vehicle->vehicle_category ? $vehicle->vehicle_category->name : 'Unknown';
            $fuelName = $vehicle->fuelPolicy ? $vehicle->fuelPolicy->name : 'Petrol';

            $carImage = null;
            if (!empty($vehicle->photo)) {
                if (filter_var($vehicle->photo, FILTER_VALIDATE_URL)) {
                    $carImage = $vehicle->photo;
                } elseif (is_numeric($vehicle->photo) && $vehicle->vehiclePhoto) {
                    $carImage = asset('img/vehicles/' . $vehicle->vehiclePhoto->photo);
                } else {
                    $carImage = asset('img/vehicles/' . $vehicle->photo);
                }
            }

            return [
                'id' => 'sup-v' . $vehicle->id,
                'name' => $supplierName,
                'logo' => $vehicle->supplierUser && !empty($vehicle->supplierUser->logo) 
                    ? (filter_var($vehicle->supplierUser->logo, FILTER_VALIDATE_URL) ? $vehicle->supplierUser->logo : asset('img/' . $vehicle->supplierUser->logo))
                    : '',
                'carName' => $vehicle->name,
                'carImage' => $carImage,
                'category' => $categoryName,
                'transmission' => 'Automatic',
                'fuel' => $fuelName,
                'seats' => 5,
                'dailyPrice' => (float) $vehicle->price,
                'weeklyPrice' => (float) $vehicle->week_price,
                'monthlyPrice' => (float) $vehicle->month_price,
                'rating' => 4.5,
                'availability' => 5,
                'marketPosition' => 'Competitive',
                'negotiationStatus' => $vehicle->negotiation_status ?? 'none',
                'lastUpdated' => $vehicle->updated_at ? $vehicle->updated_at->format('Y-m-d') : date('Y-m-d'),
                'branchLocations' => $vehicle->branches ? $vehicle->branches->pluck('name')->toArray() : [],
                'fleetSize' => 10,
                'contactEmail' => $vehicle->supplierUser->email ?? '',
                'contactPhone' => $vehicle->supplierUser->phone ?? '',
                'notes' => $vehicle->negotiation_notes ?? '',
                'priority' => $vehicle->negotiation_priority ?? 'Low'
            ];
        });

        return response()->json([
            'data' => $data,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $vehicles->currentPage(),
                'last_page' => $vehicles->lastPage(),
                'total' => $vehicles->total(),
                'per_page' => $vehicles->perPage()
            ]
        ]);
    }

    public function updateNegotiation(Request $request, $id)
    {
        $vehicleId = str_replace('sup-v', '', $id);
        $vehicle = Vehicle::findOrFail($vehicleId);

        $request->validate([
            'negotiationStatus' => 'nullable|string',
            'notes' => 'nullable|string',
            'priority' => 'nullable|string'
        ]);

        if ($request->has('negotiationStatus')) {
            $vehicle->negotiation_status = $request->negotiationStatus;
        }
        
        if ($request->has('notes')) {
            $vehicle->negotiation_notes = $request->notes;
        }
        if ($request->has('priority')) {
            $vehicle->negotiation_priority = $request->priority;
        }

        $vehicle->save();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $id,
                'negotiationStatus' => $vehicle->negotiation_status,
                'notes' => $vehicle->negotiation_notes,
                'priority' => $vehicle->negotiation_priority,
                'updatedAt' => $vehicle->updated_at->toIso8601String()
            ]
        ]);
    }
}
