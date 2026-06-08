<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $request = new \Illuminate\Http\Request();
    $request->merge(['per_page' => 10]);
    $controller = new \App\Http\Controllers\ProfitsController();
    $response = $controller->show($request);
    echo "Response Code: " . $response->getStatusCode() . "\n";
    echo "Response Content: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "Global Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
