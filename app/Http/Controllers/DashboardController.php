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
            $avgRating = $avgRatingVal ? round($avgRatingVal, 1) : null;

            // (debug fields removed)


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
            \Illuminate\Support\Facades\Log::info("Dashboard index request inputs: " . json_encode(request()->all()));

            // ─── Custom Period Comparison API Request ───
            if (request()->has('compare')) {
                $p1Start = request('p1_start');
                $p1End = request('p1_end');
                $p2Start = request('p2_start');
                $p2End = request('p2_end');

                $p1Count = DB::table('rentals')
                    ->whereBetween('created_at', [$p1Start . ' 00:00:00', $p1End . ' 23:59:59'])
                    ->count();

                $p2Count = DB::table('rentals')
                    ->whereBetween('created_at', [$p2Start . ' 00:00:00', $p2End . ' 23:59:59'])
                    ->count();

                $p1Revenue = DB::table('rentals')
                    ->whereBetween('created_at', [$p1Start . ' 00:00:00', $p1End . ' 23:59:59'])
                    ->whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                    ->sum(DB::raw('price - supplier_price'));

                $p2Revenue = DB::table('rentals')
                    ->whereBetween('created_at', [$p2Start . ' 00:00:00', $p2End . ' 23:59:59'])
                    ->whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                    ->sum(DB::raw('price - supplier_price'));

                return response()->json([
                    'status' => true,
                    'data' => [
                        'period1' => [
                            'bookings' => $p1Count,
                            'revenue' => round((float)$p1Revenue, 2)
                        ],
                        'period2' => [
                            'bookings' => $p2Count,
                            'revenue' => round((float)$p2Revenue, 2)
                        ]
                    ]
                ]);
            }

            $charts = new stdClass();
            
            // Real Database-wide Stats
            $totalCompanies = User::whereIn('role', ['active_supplier', 'under_review'])->count();
            $totalBookings = Rental::count();
            $totalCars = Vehicle::count();
            $totalRevenue = Rental::whereIn('order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->sum(DB::raw('price - supplier_price'));
            
            $avgRatingVal = Rental::whereNotNull('rate')->avg('rate');
            $avgRating = $avgRatingVal ? round($avgRatingVal, 1) : null;
            
            // Legacy / Chart Queries
            $supplierRevenue = DB::select("SELECT SUM(price - supplier_price) as profit,
                                                 COUNT(*) as bookings,
                                                 supplier_id,
                                                 users.name as supplier_name
                                              FROM rentals
                                              JOIN users on users.id = rentals.supplier_id
                                              WHERE rentals.order_status IN (:confirmed, :reconciled)
                                              GROUP BY rentals.supplier_id,users.name
                                              ORDER BY bookings desc
                                              ", [
                                                  'confirmed' => RentalStatuses::CONFIRMED,
                                                  'reconciled' => RentalStatuses::RECONCILED
                                              ]);

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
                
            // ─── Detailed Booking Trends (Days, Weeks, Months, Years) ───
            // Anchor to the latest booking date so development/mock data shows populated charts
            $latestRental = DB::table('rentals')->latest('created_at')->first();
            $anchorDate = $latestRental ? Carbon::parse($latestRental->created_at) : Carbon::now();

            $dailySql = $isSqlite ? "strftime('%Y-%m-%d', created_at)" : ($isPgsql ? "to_char(created_at, 'YYYY-MM-DD')" : "DATE_FORMAT(created_at, '%Y-%m-%d')");
            $dailyData = DB::table('rentals')
                ->select(DB::raw("{$dailySql} as period"), DB::raw("COUNT(*) as count"))
                ->where('created_at', '>=', $anchorDate->copy()->subDays(30))
                ->groupBy(DB::raw($dailySql))
                ->get()
                ->pluck('count', 'period')
                ->toArray();

            $dailyTrend = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = $anchorDate->copy()->subDays($i);
                $key = $date->format('Y-m-d');
                $dailyTrend[] = [
                    'label' => $date->format('d M'),
                    'bookings' => (int)($dailyData[$key] ?? 0)
                ];
            }

            // Weekly Trend (last 12 weeks from anchor date)
            $weeklyRaw = DB::table('rentals')
                ->select('created_at')
                ->where('created_at', '>=', $anchorDate->copy()->subWeeks(12))
                ->get();

            $weeklyTrend = [];
            for ($i = 11; $i >= 0; $i--) {
                $carbonDate = $anchorDate->copy()->subWeeks($i);
                $startOfWeek = $carbonDate->copy()->startOfWeek();
                $endOfWeek = $carbonDate->copy()->endOfWeek();
                $count = $weeklyRaw->filter(function($r) use ($startOfWeek, $endOfWeek) {
                    $created = Carbon::parse($r->created_at);
                    return $created->between($startOfWeek, $endOfWeek);
                })->count();

                $weeklyTrend[] = [
                    'label' => 'Wk ' . $carbonDate->format('W, Y'),
                    'bookings' => $count
                ];
            }

            // Monthly Trend (Chronological last 12 months from anchor date)
            $monthlyRaw = DB::table('rentals')
                ->select('created_at')
                ->where('created_at', '>=', $anchorDate->copy()->subMonths(12))
                ->get();

            $monthlyTrend = [];
            for ($i = 11; $i >= 0; $i--) {
                $date = $anchorDate->copy()->subMonths($i);
                $startOfMonth = $date->copy()->startOfMonth();
                $endOfMonth = $date->copy()->endOfMonth();
                $count = $monthlyRaw->filter(function($r) use ($startOfMonth, $endOfMonth) {
                    $created = Carbon::parse($r->created_at);
                    return $created->between($startOfMonth, $endOfMonth);
                })->count();

                $monthlyTrend[] = [
                    'label' => $date->format('M Y'),
                    'bookings' => $count
                ];
            }

            // Yearly Trend (last 5 years from anchor date)
            $yearlyRaw = DB::table('rentals')
                ->select('created_at')
                ->where('created_at', '>=', $anchorDate->copy()->subYears(5))
                ->get();

            $yearlyTrend = [];
            for ($i = 4; $i >= 0; $i--) {
                $year = $anchorDate->copy()->subYears($i)->year;
                $count = $yearlyRaw->filter(function($r) use ($year) {
                    return Carbon::parse($r->created_at)->year === $year;
                })->count();

                $yearlyTrend[] = [
                    'label' => (string)$year,
                    'bookings' => $count
                ];
            }

            $charts->bookingTrends = [
                'day' => $dailyTrend,
                'week' => $weeklyTrend,
                'month' => $monthlyTrend,
                'year' => $yearlyTrend
            ];
                
            $charts->supplierRevenue = $supplierRevenue;
            $charts->NumberOfActiveSuppliers = $NumberOfActiveSuppliers;
            $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
            $charts->latestRentalsTransactions = Rental::query()->orderBy('updated_at', 'desc')->limit(5)->get();
            $charts->latestVehicles = Vehicle::query()->orderBy('created_at', 'desc')->limit(4)->get();
            $charts->customerTransactions = Rental::query()->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();

            // Real Top Vehicles from rentals join vehicles
            $topVehiclesFromRentals = DB::table('rentals')
                ->join('vehicles', 'vehicles.id', '=', 'rentals.vehicle_id')
                ->whereIn('rentals.order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->select('vehicles.name', DB::raw('count(*) as bookings'))
                ->groupBy('vehicles.id', 'vehicles.name')
                ->orderByDesc('bookings')
                ->limit(8)
                ->get()
                ->map(function($v) {
                    $name = trim($v->name ?? '');
                    return [
                        'name'     => $name ?: 'Unknown Vehicle',
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

            // 1. Country, Branch & Airport Statistics (Normalized & Unique)
            $normalizeCountry = function($country) {
                $c = mb_strtolower(trim($country));
                if ($c === 'uae' || $c === 'united arab emirates') {
                    return 'united arab emirates';
                }
                if ($c === 'turkey' || $c === 'türkiye') {
                    return 'türkiye';
                }
                return $c;
            };

            $rawBranches = DB::table('branches')
                ->join('users', 'users.id', '=', 'branches.company_id')
                ->select('branches.id', 'branches.country', 'branches.location_type', 'branches.airport_id', 'branches.name')
                ->whereNull('branches.deleted_at')
                ->where('branches.activation', true)
                ->where('users.role', 'active_supplier')
                ->get();

            // Bookings count per country (raw database query)
            $rawBookings = DB::table('rentals')
                ->join('vehicles', 'vehicles.id', '=', 'rentals.vehicle_id')
                ->join('branches', 'branches.id', '=', 'vehicles.pickup_loc')
                ->whereIn('rentals.order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->select('branches.country', DB::raw('count(*) as bookings_count'))
                ->whereNotNull('branches.country')
                ->where('branches.country', '!=', '')
                ->groupBy('branches.country')
                ->get();

            // Let's normalize country names consistently
            $normalizeCountryName = function($country) {
                $c = trim($country);
                $lower = mb_strtolower($c);
                if ($lower === 'uae' || $lower === 'united arab emirates') {
                    return 'United Arab Emirates';
                }
                if ($lower === 'turkey' || $lower === 'türkiye') {
                    return 'Turkey';
                }
                if ($lower === 'saudi' || $lower === 'saudi arabia') {
                    return 'Saudi Arabia';
                }
                if ($lower === 'bosnia and herzegovina' || $lower === 'bosnia and herzegovina') {
                    return 'Bosnia and Herzegovina';
                }
                return ucwords($lower);
            };

            // Aggregate branch details in PHP
            $aggregated = [];
            foreach ($rawBranches as $branch) {
                if (empty($branch->country)) continue;
                $normalized = $normalizeCountryName($branch->country);
                
                if (!isset($aggregated[$normalized])) {
                    $aggregated[$normalized] = [
                        'country' => $normalized,
                        'branches' => 0,
                        'airports' => 0,
                        'bookings' => 0,
                        'branch_names' => [],
                        'airport_names' => [],
                        'seen_airports' => [], // helper to distinct airport_id
                    ];
                }

                $aggregated[$normalized]['branches']++;
                
                // Determine if it is airport type
                $branchNameLower = strtolower($branch->name);
                $isAirportByName = str_contains($branchNameLower, 'airport') || 
                                   str_contains($branchNameLower, 'aeroport') || 
                                   str_contains($branchNameLower, 'havalim') || 
                                   str_contains($branch->name, 'مطار');

                $isAirport = strtolower($branch->location_type) === 'airport' || 
                             $branch->airport_id !== null || 
                             $isAirportByName;

                if ($isAirport) {
                    // Check if it's a unique airport ID or name for this country
                    $airportKey = $branch->airport_id ?: $branch->name;
                    if (!in_array($airportKey, $aggregated[$normalized]['seen_airports'])) {
                        $aggregated[$normalized]['seen_airports'][] = $airportKey;
                        $aggregated[$normalized]['airports']++;
                    }
                    
                    if (!empty($branch->name)) {
                        $aggregated[$normalized]['airport_names'][] = $branch->name;
                    }
                } else {
                    if (!empty($branch->name)) {
                        $aggregated[$normalized]['branch_names'][] = $branch->name;
                    }
                }
            }

            // Add bookings to aggregated
            foreach ($rawBookings as $row) {
                if (empty($row->country)) continue;
                $normalized = $normalizeCountryName($row->country);
                if (isset($aggregated[$normalized])) {
                    $aggregated[$normalized]['bookings'] += (int) $row->bookings_count;
                }
            }

            // Format lists (unique, values, limit to 20) and sort by bookings desc
            $countryLocationsList = collect($aggregated)->map(function($item) {
                $item['branch_names'] = collect($item['branch_names'])->unique()->values()->take(20)->toArray();
                $item['airport_names'] = collect($item['airport_names'])->unique()->values()->take(20)->toArray();
                unset($item['seen_airports']);
                return $item;
            })->sortByDesc('bookings')->values();

            $totalCountriesCount = collect($aggregated)->count();
            $totalAirportsCount = collect($aggregated)->sum('airports');
            $totalBranchesCount = collect($aggregated)->sum('branches');

            $charts->country_locations_stats = [
                'total_countries' => $totalCountriesCount,
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
                    ->whereIn('rentals.order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
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
                ->whereIn('rentals.order_status', [RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
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
                'completed_rentals' => DB::table('rentals')->where('order_status', RentalStatuses::RECONCILED)->count(),
                'active_rentals'    => DB::table('rentals')->where('order_status', RentalStatuses::CONFIRMED)->count(),
                'cancelled_rentals' => DB::table('rentals')->whereIn('order_status', [RentalStatuses::CANCELED, RentalStatuses::REJECTED])->count(),
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
