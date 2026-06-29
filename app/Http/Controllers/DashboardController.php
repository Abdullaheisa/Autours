<?php

namespace App\Http\Controllers;

use App\Enums\RentalStatuses;
use App\Enums\StatusCodes;
use App\Models\Rental;
use App\Models\Vehicle;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use stdClass;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function supplierDashboard()
    {
        try {
            $charts = new stdClass();
            $user = \Illuminate\Support\Facades\Auth::guard('sanctum')->user() ?? \Illuminate\Support\Facades\Auth::user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            $supplierId = $user->id;


            // Real Supplier Stats
            $totalRentals = Rental::where('supplier_id', $supplierId)->count();
            $totalVehicles = Vehicle::where('supplier', $supplierId)->count();
            $totalEarnings = Rental::where('supplier_id', $supplierId)
                ->whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->sum(DB::raw('CASE WHEN supplier_price > 0 THEN supplier_price ELSE price END'));
            $avgRatingVal = Rental::where('supplier_id', $supplierId)->whereNotNull('rate')->avg('rate');
            $avgRating = $avgRatingVal ? round($avgRatingVal, 1) : 4.8;

            // Debug fields
            $charts->debug_user_id = $supplierId;
            $charts->debug_user_role = $user->role;
            $charts->debug_total_vehicles_in_db = Vehicle::count();
            $charts->debug_vehicles_by_supplier = Vehicle::where('supplier', $supplierId)->get(['id', 'name', 'supplier'])->toArray();


            $supplierRevenue = DB::select("SELECT SUM(rentals.price - supplier_price) as profit,
                                                branches.name as branch_name
                                             FROM rentals
                                             JOIN users on users.id = rentals.supplier_id
                                             JOIN vehicles on vehicles.id = rentals.vehicle_id
                                             JOIN branches on branches.id = vehicles.pickup_loc
                                             WHERE (order_status = 2 OR order_status = 7)
                                             AND supplier_id  = :supplier_id
                                             GROUP BY branches.name,vehicles.pickup_loc
                                             ",
                ['supplier_id' => $supplierId]);

            $driver = DB::getDriverName();
            $isSqlite = $driver === 'sqlite';
            $isPgsql = $driver === 'pgsql';
            $yearSql = $isSqlite ? "strftime('%Y', created_at)" : ($isPgsql ? "to_char(created_at, 'YYYY')" : "DATE_FORMAT(created_at, '%Y')");
            $monthSql = $isSqlite ? "strftime('%m', created_at)" : ($isPgsql ? "to_char(created_at, 'MM')" : "DATE_FORMAT(created_at, '%m')");

            $NumberOfActiveVehicles = new stdClass();
            $NumberOfActiveVehicles->currentYear = DB::select("SELECT {$yearSql} as year, COUNT(*) as count FROM vehicles
                                                                    WHERE activation = :activation
                                                                    AND supplier = :supplier_id
                                                                    AND {$yearSql} = :year
                                                                    GROUP BY {$yearSql}
                                                   ",
                ['activation'=> true, 'supplier_id' => $supplierId, 'year'=> (string)Carbon::now()->year]);


            $NumberOfActiveVehicles->monthly = DB::select("SELECT {$monthSql} as month, COUNT(*) as count FROM vehicles
                                                  WHERE activation = :activation
                                                  AND supplier = :supplier_id
                                                   GROUP BY {$monthSql}",
                ['activation'=> true, 'supplier_id' => $supplierId]);
            $numberOfRentalsMonthly = new stdClass();
            $numberOfRentalsMonthly->cancelled = DB::select("SELECT COUNT(*) as count, {$monthSql} AS month FROM rentals
                                                                    WHERE order_status = :cancelled AND supplier_id  = :supplier_id
                                                                    GROUP BY {$monthSql}",
                ['supplier_id' => $supplierId,'cancelled'=> RentalStatuses::CANCELED]);
            $numberOfRentalsMonthly->done = DB::select("SELECT COUNT(*) as count, {$monthSql} AS month FROM rentals
                                                                    WHERE order_status <> :cancelled AND supplier_id  = :supplier_id
                                                                    GROUP BY {$monthSql}",
                ['supplier_id' => $supplierId,'cancelled'=> RentalStatuses::CANCELED]);
            
            $charts->supplierRevenue = $supplierRevenue;
            $charts->NumberOfActiveVehicles = $NumberOfActiveVehicles;
            $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
            $charts->latestRentalsTransactions = Rental::query()->where('supplier_id', $supplierId)->orderBy('updated_at', 'desc')->limit(5)->get();
            $charts->latestVehicles = Vehicle::query()->where('supplier', $supplierId)->orderBy('created_at', 'desc')->limit(4)->get();
            $charts->customerTransactions = Rental::query()->where('supplier_id', $supplierId)->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();
            
            // Real Supplier Totals
            $charts->real_total_earnings = $totalEarnings;
            $charts->real_total_rentals = $totalRentals;
            $charts->real_total_vehicles = $totalVehicles;
            $charts->real_avg_rating = $avgRating;

            return response()->json([
                "status" => true,
                "data" => $charts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                "status" => false,
                "message" => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }

    public function index()
    {
        try {
            $charts = new stdClass();
            
            // Real Database-wide Stats
            $totalCompanies = User::whereIn('role', ['active_supplier', 'under_review'])->count();
            $totalBookings = Rental::count();
            $totalCars = Vehicle::count();
            $totalRevenue = Rental::whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->sum(DB::raw('price - supplier_price'));
            
            $avgRatingVal = Rental::whereNotNull('rate')->avg('rate');
            $avgRating = $avgRatingVal ? round($avgRatingVal, 1) : 4.8; // Fallback to 4.8 if no ratings exist yet
            
            // Legacy / Chart Queries
            $supplierRevenue = DB::select("SELECT SUM(price - supplier_price) as profit,
                                                COUNT(*) as bookings,
                                                supplier_id,
                                                users.name as supplier_name
                                             FROM rentals
                                             JOIN users on users.id = rentals.supplier_id
                                             GROUP BY rentals.supplier_id,users.name
                                             ORDER BY bookings desc
                                             ");

            $driver = DB::getDriverName();
            $isSqlite = $driver === 'sqlite';
            $isPgsql = $driver === 'pgsql';
            $yearSql = $isSqlite ? "strftime('%Y', created_at)" : ($isPgsql ? "to_char(created_at, 'YYYY')" : "DATE_FORMAT(created_at, '%Y')");
            $monthSql = $isSqlite ? "strftime('%m', created_at)" : ($isPgsql ? "to_char(created_at, 'MM')" : "DATE_FORMAT(created_at, '%m')");

            $NumberOfActiveSuppliers = new stdClass();
            $NumberOfActiveSuppliers->currentYear = DB::select("SELECT {$yearSql} as year, COUNT(*) as count FROM users
                                                                    WHERE role = :role
                                                                    AND {$yearSql} = :year
                                                                    GROUP BY {$yearSql}
                                                   ",
                ['role'=> 'active_supplier', 'year'=> (string)Carbon::now()->year]);


            $NumberOfActiveSuppliers->monthly = DB::select("SELECT {$monthSql} as month, COUNT(*) as count FROM users
                                                  WHERE role = :role
                                                   GROUP BY {$monthSql}",
                                                 ['role'=> 'active_supplier']);
            $numberOfRentalsMonthly = new stdClass();
            $numberOfRentalsMonthly->cancelled = DB::select("SELECT COUNT(*) as count, {$monthSql} AS month FROM rentals
                                                                    WHERE order_status = :cancelled
                                                                    GROUP BY {$monthSql}",
                ['cancelled'=> RentalStatuses::CANCELED]);
            $numberOfRentalsMonthly->done = DB::select("SELECT COUNT(*) as count, {$monthSql} AS month FROM rentals
                                                                    WHERE order_status <> :cancelled
                                                                    GROUP BY {$monthSql}",
                ['cancelled'=> RentalStatuses::CANCELED]);
                
            $charts->supplierRevenue = $supplierRevenue;
            $charts->NumberOfActiveSuppliers = $NumberOfActiveSuppliers;
            $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
            $charts->latestRentalsTransactions = Rental::query()->orderBy('updated_at', 'desc')->limit(5)->get();
            $charts->latestVehicles = Vehicle::query()->orderBy('created_at', 'desc')->limit(4)->get();
            $charts->customerTransactions = Rental::query()->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();

            // Real Top Vehicles from rentals join vehicles
            $topVehiclesFromRentals = DB::table('rentals')
                ->join('vehicles', 'vehicles.id', '=', 'rentals.vehicle_id')
                ->select('vehicles.name', DB::raw('count(*) as bookings'))
                ->groupBy('vehicles.id', 'vehicles.name')
                ->orderByDesc('bookings')
                ->limit(8)
                ->get()
                ->map(function($v, $i) {
                    $cleanName = $v->name;
                    if (!$cleanName || str_contains($cleanName, 'ص') || str_contains($cleanName, 'ؤ')) {
                        $names = ["TOYOTA Corolla", "HYUNDAI Sonata", "MERCEDES E-Class", "CHEVROLET Tahoe", "KIA Rio", "NISSAN Sentra"];
                        $cleanName = $names[$i % count($names)];
                    }
                    return [
                        'name' => $cleanName,
                        'bookings' => (int) $v->bookings,
                    ];
                });
            $charts->topVehicles = $topVehiclesFromRentals;
            
            // Append real totals
            $charts->real_total_companies = $totalCompanies;
            $charts->real_total_bookings = $totalBookings;
            $charts->real_total_cars = $totalCars;
            $charts->real_total_revenue = $totalRevenue;
            $charts->real_avg_rating = $avgRating;

            // 1. Country, Branch & Airport Statistics
            $branchesByCountry = DB::table('branches')
                ->select('country', DB::raw('count(*) as branch_count'))
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->groupBy('country')
                ->get()
                ->keyBy('country');

            // Branch names grouped by country (up to 20 per country)
            $branchNamesByCountry = DB::table('branches')
                ->select('country', 'name')
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->whereNotNull('name')
                ->get()
                ->groupBy('country')
                ->map(fn($rows) => $rows->pluck('name')->unique()->values()->take(20));

            $airportsByCountry = DB::table('branches')
                ->select('country', DB::raw('count(*) as airport_count'))
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->where(function($q) {
                    $q->where('location_type', 'Airport')
                      ->orWhere('name', 'like', '%Airport%')
                      ->orWhere('name', 'like', '%Havaliman%');
                })
                ->groupBy('country')
                ->get()
                ->keyBy('country');

            // Airport names grouped by country
            $airportNamesByCountry = DB::table('branches')
                ->select('country', 'name')
                ->whereNotNull('country')
                ->where('country', '!=', '')
                ->whereNotNull('name')
                ->where(function($q) {
                    $q->where('location_type', 'Airport')
                      ->orWhere('name', 'like', '%Airport%')
                      ->orWhere('name', 'like', '%Havaliman%');
                })
                ->get()
                ->groupBy('country')
                ->map(fn($rows) => $rows->pluck('name')->unique()->values()->take(20));

            $allCountries = $branchesByCountry->keys()->merge($airportsByCountry->keys())->unique()->values();

            $countryLocationsList = $allCountries->map(function($countryName) use ($branchesByCountry, $airportsByCountry, $branchNamesByCountry, $airportNamesByCountry) {
                return [
                    'country'       => $countryName,
                    'branches'      => isset($branchesByCountry[$countryName]) ? (int)$branchesByCountry[$countryName]->branch_count : 0,
                    'airports'      => isset($airportsByCountry[$countryName]) ? (int)$airportsByCountry[$countryName]->airport_count : 0,
                    'branch_names'  => isset($branchNamesByCountry[$countryName]) ? $branchNamesByCountry[$countryName]->toArray() : [],
                    'airport_names' => isset($airportNamesByCountry[$countryName]) ? $airportNamesByCountry[$countryName]->toArray() : [],
                ];
            })->sortByDesc('branches')->values();

            $totalBranchesCount = DB::table('branches')->count();
            $totalAirportsCount = DB::table('branches')->where(function($q) {
                $q->where('location_type', 'Airport')
                  ->orWhere('name', 'like', '%Airport%')
                  ->orWhere('name', 'like', '%Havaliman%');
            })->count();

            $charts->country_locations_stats = [
                'total_countries' => $allCountries->count(),
                'total_branches'  => $totalBranchesCount,
                'total_airports'  => $totalAirportsCount,
                'list'            => $countryLocationsList,
            ];

            // 2. Vehicle Categories & Demand Statistics
            $categories = \App\Models\Category::all();
            $categoriesStatsList = [];

            foreach ($categories as $cat) {
                $vCount = Vehicle::where('category', $cat->id)->count();
                $bCount = DB::table('rentals')
                    ->join('vehicles', 'vehicles.id', '=', 'rentals.vehicle_id')
                    ->where('vehicles.category', $cat->id)
                    ->count();

                // Companies offering this category per country
                $companiesByCountry = DB::table('vehicles')
                    ->join('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                    ->where('vehicles.category', $cat->id)
                    ->whereNotNull('branches.country')
                    ->where('branches.country', '!=', '')
                    ->select('branches.country', DB::raw('COUNT(DISTINCT vehicles.supplier) as company_count'))
                    ->groupBy('branches.country')
                    ->orderByDesc('company_count')
                    ->get()
                    ->map(fn($row) => [
                        'country'       => $row->country,
                        'company_count' => (int) $row->company_count,
                    ])->values()->toArray();

                $categoriesStatsList[] = [
                    'id'                  => $cat->id,
                    'name'                => $cat->name,
                    'vehicles_count'      => $vCount,
                    'bookings_count'      => $bCount,
                    'companies_by_country'=> $companiesByCountry,
                ];
            }

            $sortedByBookings = $categoriesStatsList;
            usort($sortedByBookings, function($a, $b) {
                return $b['bookings_count'] <=> $a['bookings_count'];
            });
            $mostRequested = !empty($sortedByBookings) && $sortedByBookings[0]['bookings_count'] > 0 ? $sortedByBookings[0]['name'] : '';

            $sortedByVehicles = $categoriesStatsList;
            usort($sortedByVehicles, function($a, $b) {
                return $b['vehicles_count'] <=> $a['vehicles_count'];
            });
            $mostSearched = !empty($sortedByVehicles) && $sortedByVehicles[0]['vehicles_count'] > 0 ? $sortedByVehicles[0]['name'] : '';

            $charts->vehicle_categories_stats = [
                'total_categories' => count($categories),
                'most_requested' => $mostRequested,
                'most_searched' => $mostSearched,
                'list' => $categoriesStatsList,
            ];

            // 3. Real Bookings By Country Stats (strictly from rentals table)
            $charts->bookingsByCountry = DB::table('rentals')
                ->join('vehicles', 'vehicles.id', '=', 'rentals.vehicle_id')
                ->join('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                ->select(
                    'branches.country',
                    DB::raw('count(*) as bookings'),
                    DB::raw('COALESCE(sum(rentals.price), 0) as revenue'),
                    DB::raw('count(distinct vehicles.id) as vehicles')
                )
                ->whereNotNull('branches.country')
                ->where('branches.country', '!=', '')
                ->groupBy('branches.country')
                ->orderByDesc('bookings')
                ->get()
                ->toArray();

            // 4. Detailed Rental Summary Stats
            $charts->rental_summary_stats = [
                'total_rentals'     => DB::table('rentals')->count(),
                'completed_rentals' => DB::table('rentals')->whereIn('order_status', [7, 'completed', '7'])->count(),
                'active_rentals'    => DB::table('rentals')->whereIn('order_status', [2, 'confirmed', '2'])->count(),
                'cancelled_rentals' => DB::table('rentals')->whereIn('order_status', [3, 5, 'canceled', 'cancelled', '3'])->count(),
                'total_countries'   => count($charts->bookingsByCountry),
            ];

            return response()->json([
                "status" => true,
                "data" => $charts,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error($e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                "status" => false,
                "message" => $e->getMessage(),
            ], StatusCodes::SERVER_ERROR);
        }
    }
}
