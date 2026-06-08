<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

header('Content-Type: application/json');
try {
    if (!Schema::hasColumn('subscribers', 'type')) {
        Schema::table('subscribers', function (Blueprint $table) {
            $table->string('type')->default('offers')->nullable();
        });
        echo json_encode(['status' => 'success', 'message' => 'Added type column to subscribers table successfully.']);
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Subscribers table already has type column.']);
    }
} catch (\Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
