<?php
require_once 'api/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    // 查询奥特曼交流群的详细信息
    $stmt = $pdo->prepare("SELECT id, group_name, group_owner_id FROM chat_groups WHERE id = 20");
    $stmt->execute();
    $group = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($group) {
        echo "Group ID: " . $group['id'] . "\n";
        echo "Group Name: " . $group['group_name'] . "\n";
        echo "Group Owner ID: " . $group['group_owner_id'] . "\n";
    } else {
        echo "Group with ID 20 not found\n";
    }
    
    // 检查当前登录用户ID
    session_start();
    echo "Current logged in user ID: " . ($_SESSION['user_id'] ?? 'Not logged in') . "\n";
    
    // 检查用户ID 72的信息
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = 72");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "User ID 72: " . $user['username'] . "\n";
    } else {
        echo "User with ID 72 not found\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>