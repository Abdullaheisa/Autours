<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $settings = \App\Models\BackgroundSetting::get()->toArray();
    header('Content-Type: application/json');
    echo json_encode($settings, JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    header('Content-Type: text/plain');
    echo "ERROR: " . $e->getMessage() . "\n";
}
