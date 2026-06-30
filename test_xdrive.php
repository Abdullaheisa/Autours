<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$BASE_URL = 'http://xdrivejson.turevsistem.com/';
$KEY_HACK = '5c0fdb7f-7322-4101-a587-ffa75cf0bd54';
$USERNAME = 'XdriveAutotours';
$PASSWORD = 'tdzkv69i5ddmev4';

$pickupId = '77';
$dropoffId = '77';
$pickupDate = '2026-07-06 10:00';
$dropoffDate = '2026-07-13 10:00';

$pickup = new \DateTime($pickupDate);
$dropoff = new \DateTime($dropoffDate);

$response = Http::timeout(60)
    ->get($BASE_URL . 'JsonRez.aspx', [
        'Key_Hack' => $KEY_HACK,
        'User_Name' => $USERNAME,
        'User_Pass' => $PASSWORD,
        'Pickup_ID' => $pickupId,
        'Drop_Off_ID' => $dropoffId,
        'Pickup_Day' => $pickup->format('d'),
        'Pickup_Month' => $pickup->format('m'),
        'Pickup_Year' => $pickup->format('Y'),
        'Drop_Off_Day' => $dropoff->format('d'),
        'Drop_Off_Month' => $dropoff->format('m'),
        'Drop_Off_Year' => $dropoff->format('Y'),
        'Pickup_Hour' => $pickup->format('H'),
        'Pickup_Min' => $pickup->format('i'),
        'Drop_Off_Hour' => $dropoff->format('H'),
        'Drop_Off_Min' => $dropoff->format('i'),
        'Currency' => 'TL',
    ]);

echo "Status: " . $response->status() . "\n";
echo "Body:\n" . $response->body() . "\n";
