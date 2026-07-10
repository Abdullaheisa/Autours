<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use App\Models\Branch;

$branches = Branch::where('company_id', 143)->get();
foreach ($branches as $branch) {
    echo "ID: {$branch->id}\n";
    echo "  Name: {$branch->name}\n";
    echo "  Location Type: {$branch->location_type}\n";
    echo "  Airport ID: " . var_export($branch->airport_id, true) . "\n";
    echo "  Country: {$branch->country}\n";
    echo "  City: {$branch->city}\n";
    echo "--------------------------\n";
}
