<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

$specs = DB::table('vehicle_specifications')
    ->select('name', 'value')
    ->distinct()
    ->get();

echo json_encode($specs, JSON_PRETTY_PRINT);
