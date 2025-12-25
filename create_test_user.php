<?php
// 创建测试用户
require_once '../client-book/SQL Connection/db_connect.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>创建测试用户</h2>";

try {
    $pdo = getPDOConnection();
    
    // 检查是否已存在测试用户
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute(['test']);
    $exists = $stmt->fetch();
    
    if ($exists) {
        echo "<p style='color: orange;'>测试用户 'test' 已存在！</p>";
    } else {
        // 创建测试用户
        $username = 'test';
        $email = 'test@example.com';
        $password = '123456'; // 明文密码
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, status, create_time) VALUES (?, ?, ?, 'user', 1, NOW())");
        $result = $stmt->execute([$username, $email, $hashedPassword]);
        
        if ($result) {
            echo "<p style='color: green;'>测试用户创建成功！</p>";
            echo "<ul>";
            echo "<li>用户名：test</li>";
            echo "<li>邮箱：test@example.com</li>";
            echo "<li>密码：123456</li>";
            echo "</ul>";
        } else {
            echo "<p style='color: red;'>创建测试用户失败！</p>";
        }
    }
    
    echo "<br><h3>所有用户列表：</h3>";
    $stmt = $pdo->query("SELECT id, username, email, role, status FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>ID</th><th>用户名</th><th>邮箱</th><th>角色</th><th>状态</th></tr>";
    
    foreach ($users as $user) {
        echo "<tr>";
        echo "<td>" . $user['id'] . "</td>";
        echo "<td>" . htmlspecialchars($user['username']) . "</td>";
        echo "<td>" . htmlspecialchars($user['email']) . "</td>";
        echo "<td>" . htmlspecialchars($user['role']) . "</td>";
        echo "<td>" . ($user['status'] ? '启用' : '禁用') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>错误：" . $e->getMessage() . "</p>";
}

echo "<br><p><a href='check_users.php'>刷新用户列表</a></p>";
?>