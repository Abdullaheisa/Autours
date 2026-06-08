<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Vehicle;
use App\Models\User;
use App\Models\Rental;

$data = [
    'total_vehicles' => Vehicle::count(),
    'vehicles' => Vehicle::get(['id', 'name', 'supplier', 'activation'])->toArray(),
    'users' => User::get(['id', 'name', 'email', 'role'])->toArray(),
    'rentals' => Rental::get(['id', 'supplier_id', 'vehicle_id', 'price', 'supplier_price', 'order_status'])->toArray(),
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
