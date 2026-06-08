<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

header('Content-Type: application/json');

$vehicles = DB::table('vehicles')->take(5)->pluck('id');
$specs = DB::table('vehicle_specifications')->whereIn('vehicle_id', $vehicles)->get();

echo json_encode([
    'vehicle_ids' => $vehicles,
    'specifications' => $specs
], JSON_PRETTY_PRINT);
