<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$supplier = \App\Models\User::where('email', 'bookings@streetrentacar.com')->first();
$branches = \App\Models\Branch::where('company_id', $supplier->id)->whereIn('country', ['Jordan', 'Morocco'])->whereNotNull('station_id')->get();

$service = new \App\Services\RentlyApiService();
$token = $service->getToken();
$pickup = now()->addDays(2)->format('Y-m-d 10:00');
$dropoff = now()->addDays(3)->format('Y-m-d 10:00');

$results = [];
foreach ($branches as $b) {
    if ($b->country !== 'Morocco') continue;
    $res = \Illuminate\Support\Facades\Http::withoutVerifying()
        ->withToken($token)
        ->get('https://api.rentlynetwork.com/api/AvailabilityByPlace', [
            'DeliveryLocation' => $b->station_id,
            'DropoffLocation' => $b->station_id,
            'From' => $pickup,
            'To' => $dropoff,
            'DriverAge' => 25,
            'CommercialAgreementCode' => 'pod-autours'
        ]);
        
    echo $b->name . " -> " . $res->body() . "\n";
    break; // just check the first one
}
