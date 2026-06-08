<?php

header('Content-Type: application/json');

try {
    $dbPath = __DIR__ . '/../database/database.sqlite';
    if (!file_exists($dbPath)) {
        echo json_encode(['error' => 'Database file not found at: ' . $dbPath]);
        exit;
    }

    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Check if rentals table exists
    $tableCheck = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='rentals'")->fetch();
    if (!$tableCheck) {
        echo json_encode(['error' => 'Table "rentals" does not exist in the database.']);
        exit;
    }

    // 2. Count rentals
    $count = $pdo->query("SELECT COUNT(*) FROM rentals")->fetchColumn();

    // 3. Get last 5 rentals
    $stmt = $pdo->query("SELECT id, order_number, customer_id, supplier_id, vehicle_id, price, order_status, created_at FROM rentals ORDER BY id DESC LIMIT 5");
    $lastRentals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Get last 5 users
    $stmtUsers = $pdo->query("SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 5");
    $lastUsers = $stmtUsers->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'total_rentals' => $count,
        'last_5_rentals' => $lastRentals,
        'last_5_users' => $lastUsers,
        'status' => 'success'
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
