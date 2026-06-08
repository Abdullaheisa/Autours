<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$specs = \App\Models\Specification::all();
echo json_encode($specs, JSON_PRETTY_PRINT) . PHP_EOL;
