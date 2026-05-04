<?php

namespace App\Http\Controllers;

use App\Enums\RentalStatuses;
use App\Enums\StatusCodes;
use App\Models\Rental;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use MongoDB\Driver\Session;
use stdClass;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct()
    {
        $charts = new StdClass();
        $supplierRevenue = DB::select('SELECT SUM(price - supplier_price) as profit,
                                                supplier_id,
                                                users.name as supplier_name
                                            FROM rentals
                                            JOIN users on users.id = rentals.supplier_id
                                            WHERE order_status IN (:confirmed, :reconciled)
                                            GROUP BY rentals.supplier_id,users.name
                                            ORDER BY supplier_id desc
                                             ',
            ['confirmed'=> RentalStatuses::CONFIRMED, 'reconciled'=> RentalStatuses::RECONCILED]);

        $NumberOfActiveSuppliers = new StdClass();
        $NumberOfActiveSuppliers->currentYear = DB::select('SELECT EXTRACT(YEAR FROM created_at) as year,COUNT(*) as count FROM users
                                                                    WHERE role = :role
                                                                    AND EXTRACT(YEAR FROM created_at) = :year
                                                                    GROUP BY EXTRACT(YEAR FROM created_at)
                                                   ',
            ['role'=> 'active_supplier', 'year'=> Carbon::now()->year]);


        $NumberOfActiveSuppliers->monthly = DB::select('SELECT EXTRACT(MONTH FROM created_at) as month,COUNT(*) as count FROM users
                                                  WHERE role = :role
                                                   GROUP BY EXTRACT(MONTH FROM created_at)',
            ['role'=> 'active_supplier']);
        $numberOfRentalsMonthly = new StdClass();
        $numberOfRentalsMonthly->cancelled = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status = :cancelled
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
            ['cancelled'=> RentalStatuses::CANCELED]);
        $numberOfRentalsMonthly->done = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status <> :cancelled
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
            ['cancelled'=> RentalStatuses::CANCELED]);
        $charts->supplierRevenue = $supplierRevenue;
        $charts->NumberOfActiveSuppliers = $NumberOfActiveSuppliers;
        $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
        $charts->latestRentalsTransactions = Rental::query()->orderBy('updated_at', 'desc')->limit(5)->get();
        $charts->latestVehicles = Vehicle::query()->orderBy('created_at', 'desc')->limit(4)->get();
        $charts->customerTransactions = Rental::query()->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();
        return response()->json([
            "status" => true,
            "data" => $charts,
        ]);
    }

    public function supplierDashboard()
    {
        try {

            $charts = new StdClass();
            $supplierId = auth()->user()->id;

            $supplierRevenue = DB::select('SELECT SUM(rentals.price - supplier_price) as profit,

                                                branches.name as branch_name
                                            FROM rentals
                                            JOIN users on users.id = rentals.supplier_id
                                            JOIN vehicles on vehicles.id = rentals.vehicle_id
                                            JOIN branches on branches.id = vehicles.pickup_loc
                                            WHERE order_status IN (:confirmed, :reconciled)
                                            AND supplier_id  = :supplier_id
                                            GROUP BY branches.name,vehicles.pickup_loc

                                             ',
                ['supplier_id' => $supplierId,'confirmed'=> RentalStatuses::CONFIRMED, 'reconciled'=> RentalStatuses::RECONCILED]);

            $NumberOfActiveVehicles = new StdClass();
            $NumberOfActiveVehicles->currentYear = DB::select('SELECT EXTRACT(YEAR FROM created_at) as year,COUNT(*) as count FROM vehicles
                                                                    WHERE activation = :activation
                                                                    AND EXTRACT(YEAR FROM created_at) = :year
                                                                    GROUP BY EXTRACT(YEAR FROM created_at)
                                                   ',
                ['activation'=> true, 'year'=> Carbon::now()->year]);


            $NumberOfActiveVehicles->monthly = DB::select('SELECT EXTRACT(MONTH FROM created_at) as month,COUNT(*) as count FROM users
                                                  WHERE role = :role
                                                   GROUP BY EXTRACT(MONTH FROM created_at)',
                ['role'=> 'active_supplier']);
            $numberOfRentalsMonthly = new StdClass();
            $numberOfRentalsMonthly->cancelled = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status = :cancelled AND supplier_id  = :supplier_id
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
                ['supplier_id' => $supplierId,'cancelled'=> RentalStatuses::CANCELED]);
            $numberOfRentalsMonthly->done = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status <> :cancelled AND supplier_id  = :supplier_id
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
                ['supplier_id' => $supplierId,'cancelled'=> RentalStatuses::CANCELED]);
            $charts->supplierRevenue = $supplierRevenue;
            $charts->NumberOfActiveVehicles = $NumberOfActiveVehicles;
            $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
            $charts->latestRentalsTransactions = Rental::query()->where('supplier_id', $supplierId)->orderBy('updated_at', 'desc')->limit(5)->get();
            $charts->latestVehicles = Vehicle::query()->where('supplier', $supplierId)->orderBy('created_at', 'desc')->limit(4)->get();
            $charts->customerTransactions = Rental::query()->where('supplier_id', $supplierId)->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();
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
            $charts = new StdClass();
            $supplierRevenue = DB::select('SELECT SUM(price - supplier_price) as profit,
                                                supplier_id,
                                                users.name as supplier_name
                                            FROM rentals
                                            JOIN users on users.id = rentals.supplier_id
                                            WHERE order_status IN (:confirmed, :reconciled)
                                            GROUP BY rentals.supplier_id,users.name
                                            ORDER BY supplier_id desc
                                             ',
                ['confirmed'=> RentalStatuses::CONFIRMED, 'reconciled'=> RentalStatuses::RECONCILED]);

            $NumberOfActiveSuppliers = new StdClass();
            $NumberOfActiveSuppliers->currentYear = DB::select('SELECT EXTRACT(YEAR FROM created_at) as year,COUNT(*) as count FROM users
                                                                    WHERE role = :role
                                                                    AND EXTRACT(YEAR FROM created_at) = :year
                                                                    GROUP BY EXTRACT(YEAR FROM created_at)
                                                   ',
                ['role'=> 'active_supplier', 'year'=> Carbon::now()->year]);


            $NumberOfActiveSuppliers->monthly = DB::select('SELECT EXTRACT(MONTH FROM created_at) as month,COUNT(*) as count FROM users
                                                  WHERE role = :role
                                                   GROUP BY EXTRACT(MONTH FROM created_at)',
                                                 ['role'=> 'active_supplier']);
            $numberOfRentalsMonthly = new StdClass();
            $numberOfRentalsMonthly->cancelled = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status = :cancelled
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
                ['cancelled'=> RentalStatuses::CANCELED]);
            $numberOfRentalsMonthly->done = DB::select('SELECT COUNT(*) as count, EXTRACT(MONTH FROM created_at) AS month FROM rentals
                                                                    WHERE order_status <> :cancelled
                                                                    GROUP BY EXTRACT(MONTH FROM created_at)',
                ['cancelled'=> RentalStatuses::CANCELED]);
            $charts->supplierRevenue = $supplierRevenue;
            $charts->NumberOfActiveSuppliers = $NumberOfActiveSuppliers;
            $charts->numberOfRentalsMonthly = $numberOfRentalsMonthly;
            $charts->latestRentalsTransactions = Rental::query()->orderBy('updated_at', 'desc')->limit(5)->get();
            $charts->latestVehicles = Vehicle::query()->orderBy('created_at', 'desc')->limit(4)->get();
            $charts->customerTransactions = Rental::query()->with(['customer','vehicle','supplier','status'])->orderBy('created_at', 'desc')->limit(5)->get();
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
