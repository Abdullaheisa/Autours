<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$allVehicles = \App\Models\Vehicle::all();
$suppliers = \App\Models\Vehicle::pluck('supplier')->unique()->toArray();
$vehiclesList = [];
foreach ($allVehicles as $v) {
    $vehiclesList[] = [
        'id' => $v->id,
        'name' => $v->name,
        'supplier' => $v->supplier,
        'activation' => $v->activation
    ];
}

$users = \App\Models\User::all()->map(function($u) {
    return [
        'id' => $u->id,
        'name' => $u->name,
        'role' => $u->role,
        'email' => $u->email
    ];
})->toArray();

header('Content-Type: application/json');
echo json_encode([
    'total_vehicles' => $allVehicles->count(),
    'distinct_suppliers' => $suppliers,
    'vehicles' => $vehiclesList,
    'users' => $users
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
