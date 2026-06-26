<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $suppliers = \App\Models\User::whereIn('role', ['active_supplier', 'supplier'])->get();
    $results = [];
    foreach ($suppliers as $s) {
        $results[] = [
            'id' => $s->id,
            'email' => $s->email,
            'role' => $s->role,
            'vehicles_count' => \App\Models\Vehicle::where('supplier', $s->id)->count(),
            'rentals_count' => \App\Models\Rental::where('supplier_id', $s->id)->count(),
        ];
    }
    
    header('Content-Type: application/json');
    echo json_encode($results, JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    header('Content-Type: text/plain');
    echo "ERROR: " . $e->getMessage() . "\n";
}
