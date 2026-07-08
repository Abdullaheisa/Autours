<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Auth;

// Find an admin user
$admin = User::where('role', 'admin')->first();
if (!$admin) {
    echo "No admin user found!\n";
    exit;
}

echo "Found admin user: {$admin->name} ({$admin->email})\n";

// Authenticate as this admin via the web guard
Auth::guard('web')->login($admin);

// Call DashboardController@index
$controller = new DashboardController();
$response = $controller->index();

echo "Response status code: " . $response->getStatusCode() . "\n";
echo "Response data:\n";
$data = json_decode($response->getContent(), true);
print_r($data);
