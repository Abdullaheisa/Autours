<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$companyId = \App\Models\User::where('email', 'ashish@northcar.ca')->first()->id;
$branches = \App\Models\Branch::where('company_id', $companyId)->orderBy('country')->get();

$summary = [];
foreach($branches as $branch) {
    $country = $branch->country ?: 'Unknown';
    if (!isset($summary[$country])) {
        $summary[$country] = [];
    }
    $summary[$country][] = $branch->name . ' (' . $branch->station_id . ')';
}

echo json_encode($summary, JSON_PRETTY_PRINT);
