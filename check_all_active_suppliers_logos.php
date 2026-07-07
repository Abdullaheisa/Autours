<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Get all suppliers
$suppliers = \App\Models\User::where('role', 'active_supplier')
    ->get(['id', 'name', 'company', 'logo']);

echo "TOTAL ACTIVE SUPPLIERS IN DB: " . count($suppliers) . "\n\n";

foreach ($suppliers as $sup) {
    $logo = $sup->logo;
    $logoExistsLocal = false;
    $resolvedPath = '';
    
    if ($logo) {
        // Try direct public/img/
        if (file_exists(public_path('img/' . $logo))) {
            $logoExistsLocal = true;
            $resolvedPath = 'public/img/' . $logo;
        } 
        // Try public/img/company_logos/
        elseif (file_exists(public_path('img/company_logos/' . $logo))) {
            $logoExistsLocal = true;
            $resolvedPath = 'public/img/company_logos/' . $logo;
        }
    }
    
    // Check if supplier has active vehicles in any branch
    $hasVehicles = \App\Models\Vehicle::where('activation', 1)
        ->where(function($query) use ($sup) {
            $query->whereHas('branches', function($q) use ($sup) {
                $q->where('company_id', $sup->id);
            })->orWhere('pickup_loc', function($q) use ($sup) {
                // If pickup_loc directly matches a branch of this company
                $q->select('id')->from('branches')->where('company_id', $sup->id)->limit(1);
            });
        })->exists();

    echo "ID: {$sup->id} | Name: {$sup->name} | Company: {$sup->company} | Logo: " . ($logo ?: 'NULL') . "\n";
    echo "  -> Active Vehicles: " . ($hasVehicles ? 'YES' : 'NO') . "\n";
    echo "  -> Logo Exists Local: " . ($logoExistsLocal ? "YES ($resolvedPath)" : 'NO') . "\n";
    echo "--------------------------------------------------\n";
}
