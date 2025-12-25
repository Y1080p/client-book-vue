<?php
// 检查现有用户的脚本
require_once '../client-book/SQL Connection/db_connect.php';

header('Content-Type: text/html; charset=utf-8');

echo "<h2>数据库用户检查</h2>";

try {
    $pdo = getPDOConnection();
    
    // 查询所有用户
    $stmt = $pdo->query("SELECT id, username, email, role, status, create_time FROM users ORDER BY id");
    $users = $stmt->fetchAll();
    
    if (count($users) > 0) {
        echo "<h3>当前用户列表：</h3>";
        echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
        echo "<tr><th>ID</th><th>用户名</th><th>邮箱</th><th>角色</th><th>状态</th><th>创建时间</th></tr>";
        
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>" . $user['id'] . "</td>";
            echo "<td>" . htmlspecialchars($user['username']) . "</td>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . htmlspecialchars($user['role']) . "</td>";
            echo "<td>" . ($user['status'] ? '启用' : '禁用') . "</td>";
            echo "<td>" . $user['create_time'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        echo "<br><h3>测试账号信息：</h3>";
        echo "<p>如果下面没有测试账号，可以使用以下信息注册新账号：</p>";
        echo "<ul>";
        echo "<li>用户名：test</li>";
        echo "<li>邮箱：test@example.com</li>";
        echo "<li>密码：123456</li>";
        echo "</ul>";
        
    } else {
        echo "<p>数据库中没有任何用户！</p>";
        echo "<p>请先注册一个账号。</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>错误：" . $e->getMessage() . "</p>";
}
?>