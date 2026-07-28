<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new \App\Services\EmrJsonApiService();
$branches = \App\Models\Branch::whereHas('company', function($q) {
    $q->where('name', 'EMR');
})->take(10)->get();

$stationMap = [];
foreach ($branches as $b) {
    if ($b->station_id) {
        $stationMap[$b->station_id] = $b->id;
    }
}

$pickup = \Carbon\Carbon::tomorrow()->setTime(10, 0);
$dropoff = \Carbon\Carbon::tomorrow()->addDay()->setTime(10, 0);

$prices = $service->getAvailableCarsForStations($stationMap, $pickup, $dropoff, 'TL', 5);

foreach ($prices as $branchId => $cars) {
    if (!empty($cars)) {
        echo "Found cars in branch {$branchId}!\n";
        print_r(reset($cars));
        exit;
    }
}

echo "No cars found in 10 branches.\n";
