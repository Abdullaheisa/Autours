<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$schema_vehicles = Schema::getColumnListing('vehicles');
$schema_users = Schema::getColumnListing('users');
$schema_rentals = Schema::getColumnListing('rentals');

$vehicles = DB::table('vehicles')->get(['id', 'name', 'supplier', 'activation'])->take(10)->toArray();
$users = DB::table('users')->get(['id', 'name', 'email', 'role'])->toArray();
$rentals = DB::table('rentals')->get(['id', 'supplier_id', 'vehicle_id', 'price', 'supplier_price', 'order_status'])->toArray();

$results = [
    'schema_vehicles' => $schema_vehicles,
    'schema_users' => $schema_users,
    'schema_rentals' => $schema_rentals,
    'vehicles' => $vehicles,
    'users' => $users,
    'rentals' => $rentals
];

file_put_contents(__DIR__ . '/schema_dump.json', json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo "Done";
