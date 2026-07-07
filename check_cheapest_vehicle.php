<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$vehicles = \App\Models\Vehicle::where('month_price', 44.76)
    ->get(['id', 'name', 'pickup_loc', 'supplier', 'activation'])
    ->toArray();

echo "VEHICLES WITH MONTH PRICE = 44.76:\n";
print_r($vehicles);
