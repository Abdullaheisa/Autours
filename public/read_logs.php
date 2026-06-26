<?php
header('Content-Type: text/plain');
$logFile = __DIR__ . '/../storage/logs/laravel.log';

if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    echo substr($content, -4000);
} else {
    echo "Log file not found at " . $logFile;
}
