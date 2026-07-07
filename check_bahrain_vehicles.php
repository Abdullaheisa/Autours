<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$branches = \App\Models\Branch::where('country', 'like', '%Bahrain%')->pluck('id');

$vehicles = \App\Models\Vehicle::whereIn('pickup_loc', $branches)
    ->where('activation', 1)
    ->get(['id', 'name', 'price', 'month_price', 'pickup_loc'])
    ->toArray();

echo "VEHICLES FOR BAHRAIN BRANCHES (Count: " . count($vehicles) . "):\n";
print_r($vehicles);
