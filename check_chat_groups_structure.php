<?php
require_once 'api/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    // 查询chat_groups表结构
    $stmt = $pdo->query("DESCRIBE chat_groups");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "chat_groups table structure:\n";
    foreach ($columns as $column) {
        echo "Column: " . $column['Field'] . ", Type: " . $column['Type'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>