<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

if (\App\Models\User::where('role', 'customer')->count() == 0) {
    \App\Models\User::query()->insert([
        'name' => 'Dummy Customer',
        'email' => 'customer@dummy.com',
        'password' => bcrypt('password'),
        'role' => 'customer',
        'created_at' => now(),
        'updated_at' => now()
    ]);
}
if (\App\Models\Rental::count() == 0) {
    \App\Models\Rental::query()->insert([
        'customer_id' => \App\Models\User::where('role', 'customer')->first()->id ?? 1,
        'supplier_id' => 1,
        'vehicle_id' => 1,
        'order_number' => 'ATR001',
        'order_status' => 'confirmed',
        'price' => 500,
        'start_date' => now(),
        'end_date' => now()->addDays(3),
        'created_at' => now(),
        'updated_at' => now()
    ]);
}
echo "Seeded successfully!";
