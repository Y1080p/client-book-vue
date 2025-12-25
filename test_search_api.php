<?php
// 简单的搜索测试脚本
session_start();

// 模拟登录用户
$_SESSION['user_id'] = 72;
$_SESSION['username'] = 'testuser';

echo "<h1>搜索API测试</h1>";

// 包含API文件
require_once 'api/index.php';

echo "<h2>测试用户搜索</h2>";
$_GET['keyword'] = 'test';
$_GET['type'] = 'users';
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/client-book-vue/api/index.php/search?keyword=test&type=users';

// 调用搜索用户函数
echo "<h3>调用searchUsers函数</h3>";
searchUsers();

echo "<h2>测试群聊搜索</h2>";
$_GET['keyword'] = 'test';
$_GET['type'] = 'groups';
$_SERVER['REQUEST_URI'] = '/client-book-vue/api/index.php/search?keyword=test&type=groups';

// 调用搜索群聊函数
echo "<h3>调用searchGroups函数</h3>";
searchGroups();

echo "<h2>检查数据库表</h2>";
require_once 'api/db_connect.php';
$pdo = getPDOConnection();

echo "<h3>检查chat_groups表</h3>";
$stmt = $pdo->query("SHOW TABLES LIKE 'chat_groups'");
$tableExists = $stmt->fetch();
echo "chat_groups表存在: " . ($tableExists ? '是' : '否') . "<br>";

if ($tableExists) {
    echo "<h3>chat_groups表中的数据</h3>";
    $stmt = $pdo->query("SELECT * FROM chat_groups LIMIT 5");
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($groups) > 0) {
        echo "<table border='1'>";
        echo "<tr>";
        foreach ($groups[0] as $key => $value) {
            echo "<th>$key</th>";
        }
        echo "</tr>";
        
        foreach ($groups as $group) {
            echo "<tr>";
            foreach ($group as $value) {
                echo "<td>$value</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "chat_groups表中没有数据<br>";
    }
}
?>