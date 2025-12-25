<?php
require_once '../client-book/SQL Connection/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    $stmt = $pdo->prepare("SELECT username, password FROM users LIMIT 5");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        echo "=== 用户: " . $user['username'] . " ===\n";
        echo "密码: " . $user['password'] . "\n";
        echo "是否为加密密码: " . (substr($user['password'], 0, 1) === '$' ? '是' : '否') . "\n";
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>