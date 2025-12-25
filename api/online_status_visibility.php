<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 引入数据库连接
require_once 'db_connect.php';

session_start();

// 检查用户是否已登录
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '用户未登录']);
    exit();
}

$userId = $_SESSION['user_id'];

// 处理 POST 请求 - 更新在线状态可见性
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // 获取请求数据
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['isVisible'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '无效的请求数据']);
            exit();
        }
        
        $isVisible = (bool)$data['isVisible'];
        
        // 更新用户设置表中的在线状态可见性
        $stmt = $pdo->prepare("SELECT id FROM user_settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // 更新现有设置
            $stmt = $pdo->prepare("UPDATE user_settings SET settings = JSON_SET(
                COALESCE(settings, '{}'), 
                '$.showOnlineStatus', 
                ?
            ), updated_at = NOW() WHERE user_id = ?");
            $stmt->execute([$isVisible ? 1 : 0, $userId]);
        } else {
            // 创建新设置记录
            $settings = json_encode(['showOnlineStatus' => $isVisible]);
            $stmt = $pdo->prepare("INSERT INTO user_settings (user_id, settings, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
            $stmt->execute([$userId, $settings]);
        }
        
        // 更新users表中的在线状态
        // 根据可见性设置，将状态设置为offline或保持原状态
        if (!$isVisible) {
            $stmt = $pdo->prepare("UPDATE users SET online_status = 'offline', last_active_time = NOW() WHERE id = ?");
            $stmt->execute([$userId]);
        } else {
            // 如果设置为可见，恢复为在线状态
            $stmt = $pdo->prepare("UPDATE users SET online_status = 'online', last_active_time = NOW() WHERE id = ?");
            $stmt->execute([$userId]);
        }
        
        echo json_encode(['success' => true, 'message' => '在线状态可见性已更新', 'isVisible' => $isVisible]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '更新失败: ' . $e->getMessage()]);
    }
}

// 处理 GET 请求 - 获取当前在线状态可见性
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 从用户设置表获取设置
        $stmt = $pdo->prepare("SELECT settings FROM user_settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $settings = json_decode($result['settings'], true);
            $isVisible = isset($settings['showOnlineStatus']) ? (bool)$settings['showOnlineStatus'] : true;
        } else {
            // 如果没有设置，默认为可见
            $isVisible = true;
        }
        
        // 同时检查users表中的实际状态
        $stmt = $pdo->prepare("SELECT online_status FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $statusResult = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $actualStatus = $statusResult ? $statusResult['online_status'] : 'offline';
        
        echo json_encode(['success' => true, 'isVisible' => $isVisible, 'actualStatus' => $actualStatus]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '获取设置失败: ' . $e->getMessage()]);
    }
}
?>