<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Branch;

$branches = Branch::orderBy('country')->orderBy('name')->get();

$filename = 'branches_by_country.csv';
$file = fopen(__DIR__ . '/' . $filename, 'w');

fputcsv($file, ['Country', 'Branch Name', 'City', 'Location Type', 'Abbreviation']);

foreach ($branches as $branch) {
    fputcsv($file, [
        $branch->country,
        $branch->name,
        $branch->city,
        $branch->location_type,
        $branch->abriviation
    ]);
}

fclose($file);
echo "CSV generated successfully at " . __DIR__ . '/' . $filename . "\n";
