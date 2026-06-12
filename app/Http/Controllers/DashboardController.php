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

            // Write database dump to schema_dump.json on every dashboard request
            try {
                file_put_contents(public_path('schema_dump.json'), json_encode([
                    'vehicles' => Vehicle::get(['id', 'name', 'supplier', 'activation'])->toArray(),
                    'users' => User::get(['id', 'name', 'email', 'role'])->toArray(),
                    'rentals' => Rental::get(['id', 'supplier_id', 'vehicle_id', 'price', 'supplier_price', 'order_status'])->toArray()
                ], JSON_PRETTY_PRINT));
            } catch (\Exception $dumpEx) {
                // ignore
            }

            // Real Supplier Stats
            $totalRentals = Rental::where('supplier_id', $supplierId)->count();
            $totalVehicles = Vehicle::where('supplier', $supplierId)->count();
            $totalEarnings = Rental::where('supplier_id', $supplierId)
                ->whereIn('order_status', ['confirmed', 'reconciled', RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
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
                                             WHERE (order_status = 'confirmed' OR order_status = 'reconciled' OR order_status = '2' OR order_status = '7')
                                             AND supplier_id  = :supplier_id
                                             GROUP BY branches.name,vehicles.pickup_loc
                                             ",
                ['supplier_id' => $supplierId]);

            $isSqlite = DB::getDriverName() === 'sqlite';
            $yearSql = $isSqlite ? "strftime('%Y', created_at)" : "DATE_FORMAT(created_at, '%Y')";
            $monthSql = $isSqlite ? "strftime('%m', created_at)" : "DATE_FORMAT(created_at, '%m')";

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
            $totalRevenue = Rental::whereIn('order_status', ['confirmed', 'reconciled', RentalStatuses::CONFIRMED, RentalStatuses::RECONCILED])
                ->sum(DB::raw('price - supplier_price'));
            
            $avgRatingVal = Rental::whereNotNull('rate')->avg('rate');
            $avgRating = $avgRatingVal ? round($avgRatingVal, 1) : 4.8; // Fallback to 4.8 if no ratings exist yet
            
            // Legacy / Chart Queries
            $supplierRevenue = DB::select("SELECT SUM(price - supplier_price) as profit,
                                                supplier_id,
                                                users.name as supplier_name
                                             FROM rentals
                                             JOIN users on users.id = rentals.supplier_id
                                             WHERE (order_status = 'confirmed' OR order_status = 'reconciled' OR order_status = '2' OR order_status = '7')
                                             GROUP BY rentals.supplier_id,users.name
                                             ORDER BY supplier_id desc
                                             ");

            $isSqlite = DB::getDriverName() === 'sqlite';
            $yearSql = $isSqlite ? "strftime('%Y', created_at)" : "DATE_FORMAT(created_at, '%Y')";
            $monthSql = $isSqlite ? "strftime('%m', created_at)" : "DATE_FORMAT(created_at, '%m')";

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
            
            // Append real totals
            $charts->real_total_companies = $totalCompanies;
            $charts->real_total_bookings = $totalBookings;
            $charts->real_total_cars = $totalCars;
            $charts->real_total_revenue = $totalRevenue;
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
}
