<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tokens = \Illuminate\Support\Facades\DB::table('personal_access_tokens')->get()->toArray();
    $users = \App\Models\User::whereIn('id', array_column($tokens, 'tokenable_id'))->get(['id', 'email'])->toArray();
    
    header('Content-Type: application/json');
    echo json_encode([
        'tokens_count' => count($tokens),
        'tokens' => $tokens,
        'token_users' => $users
    ], JSON_PRETTY_PRINT);
} catch (\Exception $e) {
    header('Content-Type: text/plain');
    echo "ERROR: " . $e->getMessage() . "\n";
}
