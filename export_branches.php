<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Branch;

$branches = Branch::orderBy('country')->orderBy('name')->get();

// Deduplicate: group by (country, abbreviation, location_type)
// so each unique physical location appears only once in the CSV.
$unique = [];
foreach ($branches as $branch) {
    $country = $branch->country ?? '';
    $abbr    = trim($branch->abriviation ?? '');
    $type    = $branch->location_type ?? '';

    // Build a dedup key — use abbreviation when available, otherwise fall back to name
    if (!empty($abbr) && !is_numeric($abbr)) {
        $key = strtolower("{$country}|{$abbr}|{$type}");
    } else {
        $key = strtolower("{$country}|{$branch->name}|{$type}");
    }

    if (!isset($unique[$key])) {
        // Prefer the normalized_name (from airport match) over the raw supplier name
        $displayName = $branch->normalized_name ?: $branch->name;
        $unique[$key] = [
            'country'       => $country,
            'name'          => $displayName,
            'city'          => $branch->city,
            'location_type' => $type,
            'abriviation'   => $abbr,
        ];
    }
}

$filename = 'branches_by_country.csv';
$file = fopen(__DIR__ . '/' . $filename, 'w');

fputcsv($file, ['Country', 'Branch Name', 'City', 'Location Type', 'Abbreviation']);

foreach ($unique as $row) {
    fputcsv($file, [
        $row['country'],
        $row['name'],
        $row['city'],
        $row['location_type'],
        $row['abriviation'],
    ]);
}

fclose($file);
echo "CSV generated successfully at " . __DIR__ . '/' . $filename . "\n";
