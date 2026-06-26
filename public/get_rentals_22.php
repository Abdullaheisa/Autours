<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $supplierId = 22;
    $vehicles = \App\Models\Vehicle::where('supplier', $supplierId)->limit(5)->get()->toArray();
    $rentals = \App\Models\Rental::where('supplier_id', $supplierId)->get()->toArray();
    
    header('Content-Type: application/json');
    echo json_encode([
        'vehicles_count' => \App\Models\Vehicle::where('supplier', $supplierId)->count(),
        'vehicles_sample' => $vehicles,
        'rentals_count' => count($rentals),
        'rentals' => $rentals
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    header('Content-Type: text/plain');
    echo "ERROR: " . $e->getMessage() . "\n";
}
