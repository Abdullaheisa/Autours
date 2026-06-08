<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::where('email', 'Jincy@drivus.ae')->first();
if ($user) {
    var_dump($user->role);
    echo "Length: " . strlen($user->role) . "\n";
    for ($i = 0; $i < strlen($user->role); $i++) {
        echo ord($user->role[$i]) . " ";
    }
} else {
    echo "Not found";
}
