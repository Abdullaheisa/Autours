<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$allVehicles = \App\Models\Vehicle::all();
echo "Total Vehicles in Database: " . $allVehicles->count() . "\n";

$suppliers = \App\Models\Vehicle::pluck('supplier')->unique()->toArray();
echo "Distinct Suppliers in Vehicles table: " . implode(', ', $suppliers) . "\n";

foreach ($allVehicles as $v) {
    echo "Vehicle ID: {$v->id}, Name: {$v->name}, Supplier: {$v->supplier}\n";
}

$user = \App\Models\User::find(5);
if ($user) {
    echo "User 5: Name: {$user->name}, Role: {$user->role}\n";
} else {
    echo "User 5 not found!\n";
}
