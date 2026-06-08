<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    Illuminate\Support\Facades\Artisan::call('config:clear');
    echo "Config cleared\n";
    Illuminate\Support\Facades\Artisan::call('route:clear');
    echo "Route cleared\n";
    Illuminate\Support\Facades\Artisan::call('cache:clear');
    echo "Cache cleared\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
