<?php

/**
 * Standalone script to execute Laravel Artisan commands directly from the browser.
 * This bypasses Laravel's routing engine, avoiding 404 errors due to route caching.
 */

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// Bootstrap the console kernel instead of HTTP kernel so Artisan commands work properly
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$key = $_GET['key'] ?? '';
$supplier = $_GET['supplier'] ?? '';
$action = $_GET['action'] ?? '';

if ($key !== 'sync2026') {
    http_response_code(401);
    die("Unauthorized. Please provide ?key=sync2026 in the URL.");
}

if (empty($supplier)) {
    die("Please provide a supplier parameter. Example: &supplier=autofix");
}

if (!in_array($action, ['branches', 'vehicles', 'prices'])) {
    http_response_code(400);
    die("Invalid action. Use 'branches', 'vehicles', or 'prices'. Example: &action=branches");
}

$command = "{$supplier}:sync-" . ($action === 'prices' ? 'vehicles' : $action);
$params = ['--real' => true];

if ($action === 'prices') {
    $params['--prices-only'] = true;
}

try {
    $exitCode = \Illuminate\Support\Facades\Artisan::call($command, $params);
    $output = \Illuminate\Support\Facades\Artisan::output();

    echo "<pre>Command: {$command} " . ($action === 'prices' ? '--prices-only' : '') . "\nExit Code: {$exitCode}\n\nOutput:\n{$output}</pre>";
} catch (\Exception $e) {
    http_response_code(500);
    echo "Error executing command: " . $e->getMessage();
}
