<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Branch;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

$user = User::where('email', 'info@beraotokiralama.com')->first();
if (!$user) {
    die("User not found\n");
}

$branches = Branch::where('company_id', $user->id)->get();
$branchCount = $branches->count();
$countries = $branches->pluck('country')->unique()->filter()->values()->toArray();
$countryCount = count($countries);
$vehicleCount = Vehicle::where('supplier', $user->id)->count();

$vehicleWithTerms = Vehicle::where('supplier', $user->id)->whereHas('included')->count();
$hasTerms = $vehicleWithTerms > 0 ? "موجودة (تم إدراجها كـ Inclusions / شروط)" : "غير موجودة";

$vehicleWithDeposit = Vehicle::where('supplier', $user->id)->where('deposit_amount', '>', 0)->count();
$hasDeposit = $vehicleWithDeposit > 0 ? "نعم مطلوب إيداع (قيمة الإيداع موجودة مع كل سيارة)" : "غير مطلوب";

$vehiclesWithPrices = Vehicle::where('supplier', $user->id)->select('price', 'week_price', 'month_price')->first();
$hasMultiplePrices = "سعر يومي فقط";
if ($vehiclesWithPrices && ($vehiclesWithPrices->week_price > 0 || $vehiclesWithPrices->month_price > 0)) {
    $hasMultiplePrices = "يوجد أكثر من سعر (يومي، أسبوعي، شهري)";
}

$hasExtras = "غير موجودة (الإضافات تتطلب حجز مباشر Token من API)";

echo json_encode([
    'companyName' => $user->company,
    'countryCount' => $countryCount,
    'countries' => implode(', ', $countries),
    'branchCount' => $branchCount,
    'vehicleCount' => $vehicleCount,
    'hasTerms' => $hasTerms,
    'hasExtras' => $hasExtras,
    'hasMultiplePrices' => $hasMultiplePrices,
    'hasDeposit' => $hasDeposit,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
