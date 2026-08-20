<?php

error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// ------------------------------------------------------------------
// BYPASS ROUTER FOR MANUAL SYNC (Guaranteed to work even if routes are cached)
// ------------------------------------------------------------------
if (strpos($_SERVER['REQUEST_URI'] ?? '', '/manual-sync') !== false) {
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    $key = $_GET['key'] ?? '';
    
    // Extract supplier and action from URL (e.g. /api/manual-sync/autofix/branches)
    $path = explode('?', $_SERVER['REQUEST_URI'])[0];
    $parts = array_values(array_filter(explode('/', $path)));
    $syncIdx = array_search('manual-sync', $parts);
    
    $supplier = $parts[$syncIdx + 1] ?? $_GET['supplier'] ?? '';
    $action = $parts[$syncIdx + 2] ?? $_GET['action'] ?? '';

    if ($key !== 'sync2026') {
        http_response_code(401);
        die("Unauthorized. Please provide ?key=sync2026");
    }

    if (!in_array($action, ['branches', 'vehicles', 'prices'])) {
        http_response_code(400);
        die("Invalid action. Found: {$action}. Use 'branches', 'vehicles', or 'prices'.");
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
        echo "Error: " . $e->getMessage();
    }
    exit;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

require __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
