<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 引入数据库连接
require_once '../config/database.php';

session_start();

// 检查用户是否已登录
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => '用户未登录']);
    exit();
}

$userId = $_SESSION['user_id'];

// 处理 GET 请求 - 获取用户设置
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // 查询用户设置
        $stmt = $pdo->prepare("SELECT settings FROM user_settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            // 如果有设置，解码并返回
            $settings = json_decode($result['settings'], true);
            echo json_encode(['success' => true, 'settings' => $settings]);
        } else {
            // 如果没有设置，返回默认设置
            $defaultSettings = [
                'showOnlineStatus' => true,
                'allowFriendRequests' => true,
                'allowGroupInvites' => true,
                'notifyFriendMessages' => true,
                'notifyGroupMessages' => true,
                'notifyRequests' => true,
                'desktopNotification' => false,
                'theme' => 'light',
                'compactMode' => false
            ];
            echo json_encode(['success' => true, 'settings' => $defaultSettings]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '获取设置失败: ' . $e->getMessage()]);
    }
}

// 处理 POST 请求 - 更新用户设置
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // 获取请求数据
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '无效的请求数据']);
            exit();
        }
        
        // 验证并过滤设置数据
        $validSettings = [];
        $allowedSettings = [
            'showOnlineStatus' => 'boolean',
            'allowFriendRequests' => 'boolean',
            'allowGroupInvites' => 'boolean',
            'notifyFriendMessages' => 'boolean',
            'notifyGroupMessages' => 'boolean',
            'notifyRequests' => 'boolean',
            'desktopNotification' => 'boolean',
            'theme' => 'string',
            'compactMode' => 'boolean'
        ];
        
        foreach ($allowedSettings as $key => $type) {
            if (array_key_exists($key, $data)) {
                if ($type === 'boolean') {
                    $validSettings[$key] = (bool)$data[$key];
                } else {
                    $validSettings[$key] = $data[$key];
                }
            }
        }
        
        if (empty($validSettings)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => '没有有效的设置数据']);
            exit();
        }
        
        // 检查是否已有设置记录
        $stmt = $pdo->prepare("SELECT id FROM user_settings WHERE user_id = ?");
        $stmt->execute([$userId]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // 更新现有设置
            $stmt = $pdo->prepare("UPDATE user_settings SET settings = ?, updated_at = NOW() WHERE user_id = ?");
            $stmt->execute([json_encode($validSettings), $userId]);
        } else {
            // 创建新设置记录
            $stmt = $pdo->prepare("INSERT INTO user_settings (user_id, settings, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
            $stmt->execute([$userId, json_encode($validSettings)]);
        }
        
        echo json_encode(['success' => true, 'message' => '设置已更新', 'settings' => $validSettings]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => '更新设置失败: ' . $e->getMessage()]);
    }
}
?>