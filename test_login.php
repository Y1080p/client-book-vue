<?php
// 测试登录状态
session_start();

require_once '../client-book/SQL Connection/db_connect.php';

// 模拟登录
if (isset($_GET['login'])) {
    $username = $_GET['login'];
    $password = $_GET['password'] ?? '';
    
    $pdo = getPDOConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && ($password === $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        echo "登录成功！用户ID: " . $_SESSION['user_id'] . ", 用户名: " . $_SESSION['username'] . "<br>";
    } else {
        echo "登录失败<br>";
    }
}

// 检查登录状态
if (isset($_SESSION['user_id'])) {
    echo "当前登录状态：已登录<br>";
    echo "用户ID: " . $_SESSION['user_id'] . "<br>";
    echo "用户名: " . $_SESSION['username'] . "<br>";
} else {
    echo "当前登录状态：未登录<br>";
}

// 测试API响应
echo "<br>测试API响应：<br>";
$request_uri = '/client-book-vue/api/auth/check';
$api_path = '/client-book-vue/api';

if (strpos($request_uri, $api_path) === 0) {
    $request_uri = substr($request_uri, strlen($api_path));
}

$path = parse_url($request_uri, PHP_URL_PATH);
$path_segments = explode('/', trim($path, '/'));
$endpoint = $path_segments[0] ?? '';

if ($endpoint === 'auth') {
    if (isset($_SESSION['user_id'])) {
        $response = [
            'success' => true,
            'username' => $_SESSION['username']
        ];
    } else {
        $response = ['success' => false];
    }
    
    echo "API会返回: " . json_encode($response) . "<br>";
}

echo "<br><a href='?login=admin&password=admin123'>点击登录admin</a><br>";
echo "<a href='?login=yjm&password=123456'>点击登录yjm</a><br>";
echo "<a href='test_login.php'>刷新页面</a><br>";
?>