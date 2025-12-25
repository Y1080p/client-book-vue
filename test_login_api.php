<?php
// 测试登录 API
session_start();

require_once '../client-book/SQL Connection/db_connect.php';

// 模拟 POST 登录请求
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '用户名和密码不能为空']);
        return;
    }
    
    try {
        $pdo = getPDOConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND status = 1");
        $stmt->execute([$username]);
        $user = $stmt->fetch();
        
        // 支持明文密码和加密密码
        $passwordMatch = false;
        if (substr($user['password'], 0, 1) === '$') {
            // 加密密码
            $passwordMatch = password_verify($password, $user['password']);
        } else {
            // 明文密码
            $passwordMatch = ($password === $user['password']);
        }
        
        if ($user && $passwordMatch) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            echo json_encode(['success' => true, 'message' => '登录成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '用户名或密码错误']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '登录失败: ' . $e->getMessage()]);
    }
} else {
    // 检查登录状态
    if (isset($_SESSION['user_id'])) {
        echo json_encode([
            'success' => true,
            'username' => $_SESSION['username'],
            'session_id' => session_id()
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'session_id' => session_id(),
            'session_data' => $_SESSION
        ]);
    }
}
?>