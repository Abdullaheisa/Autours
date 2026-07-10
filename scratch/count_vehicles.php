<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use App\Models\User;
use App\Models\Branch;
use App\Models\Vehicle;

$suppliers = User::where('role', 'active_supplier')->get();

foreach ($suppliers as $supplier) {
    echo "Supplier: {$supplier->company} (ID: {$supplier->id})\n";
    
    // Get all branches
    $branches = Branch::where('company_id', $supplier->id)->where('activation', 1)->get();
    echo "  Total Branches: " . $branches->count() . "\n";
    
    // Group by country
    $grouped = $branches->groupBy('country');
    foreach ($grouped as $countryName => $countryBranches) {
        $branchIds = $countryBranches->pluck('id')->toArray();
        
        // Count vehicles that have pickup_loc in this branch list
        $vehiclesByPickupLoc = Vehicle::where('supplier', $supplier->id)
            ->whereIn('pickup_loc', $branchIds)
            ->where('activation', 1)
            ->count();
            
        // Count vehicles that have branch_vehicle relation to this branch list
        $vehiclesByRelation = Vehicle::where('supplier', $supplier->id)
            ->where('activation', 1)
            ->whereHas('branches', function($q) use ($branchIds) {
                $q->whereIn('branches.id', $branchIds);
            })
            ->count();
            
        // Count total unique vehicles for this supplier in this country using either method
        $unionCount = Vehicle::where('supplier', $supplier->id)
            ->where('activation', 1)
            ->where(function($query) use ($branchIds) {
                $query->whereIn('pickup_loc', $branchIds)
                      ->orWhereHas('branches', function($q) use ($branchIds) {
                          $q->whereIn('branches.id', $branchIds);
                      });
            })
            ->count();
            
        echo "    Country: {$countryName}\n";
        echo "      Vehicles by pickup_loc: {$vehiclesByPickupLoc}\n";
        echo "      Vehicles by branches relation: {$vehiclesByRelation}\n";
        echo "      Unique union count: {$unionCount}\n";
    }
}
