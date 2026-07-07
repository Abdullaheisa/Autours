<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$routesLogo = 'ROUTES_logo8c422a890bdb5721681a2b13f6e0bfa7.png';
$exists1 = file_exists(public_path('img/' . $routesLogo));
$exists2 = file_exists(public_path('img/company_logos/' . $routesLogo));
$exists3 = file_exists(public_path('img/company_logos/routes.png'));
$exists4 = file_exists(public_path('img/company_logos/routes.webp'));

echo "1. img/ROUTES_logo... : " . ($exists1 ? 'YES' : 'NO') . "\n";
echo "2. img/company_logos/ROUTES_logo... : " . ($exists2 ? 'YES' : 'NO') . "\n";
echo "3. img/company_logos/routes.png : " . ($exists3 ? 'YES' : 'NO') . "\n";
echo "4. img/company_logos/routes.webp : " . ($exists4 ? 'YES' : 'NO') . "\n";
