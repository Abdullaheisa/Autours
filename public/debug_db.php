<?php
$db = new SQLite3(__DIR__ . '/../database/database.sqlite');

echo "<h2>Vehicles in Database</h2>";
$res = $db->query("SELECT id, name, supplier, activation FROM vehicles");
echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Supplier</th><th>Activation</th></tr>";
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo "<tr><td>{$row['id']}</td><td>{$row['name']}</td><td>{$row['supplier']}</td><td>{$row['activation']}</td></tr>";
}
echo "</table>";

echo "<h2>Users in Database</h2>";
$res = $db->query("SELECT id, name, email, role FROM users");
echo "<table border='1'><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th></tr>";
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo "<tr><td>{$row['id']}</td><td>{$row['name']}</td><td>{$row['email']}</td><td>{$row['role']}</td></tr>";
}
echo "</table>";

echo "<h2>Rentals in Database</h2>";
$res = $db->query("SELECT id, supplier_id, vehicle_id, price, supplier_price, order_status FROM rentals");
echo "<table border='1'><tr><th>ID</th><th>Supplier ID</th><th>Vehicle ID</th><th>Price</th><th>Supplier Price</th><th>Status</th></tr>";
while ($row = $res->fetchArray(SQLITE3_ASSOC)) {
    echo "<tr><td>{$row['id']}</td><td>{$row['supplier_id']}</td><td>{$row['vehicle_id']}</td><td>{$row['price']}</td><td>{$row['supplier_price']}</td><td>{$row['order_status']}</td></tr>";
}
echo "</table>";
