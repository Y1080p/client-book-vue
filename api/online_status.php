<?php
// 在线状态管理API
require_once 'db_connect.php';

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

session_start();

// 检查用户是否登录
function checkAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => '未登录']);
        exit;
    }
    return $_SESSION['user_id'];
}

// 更新用户在线状态
function updateOnlineStatus() {
    $user_id = checkAuth();
    
    try {
        $pdo = getPDOConnection();
        
        // 更新用户的最后活跃时间
        $stmt = $pdo->prepare("UPDATE users SET last_active_time = NOW() WHERE id = ?");
        $stmt->execute([$user_id]);
        
        echo json_encode(['success' => true, 'message' => '在线状态已更新']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => '更新在线状态失败: ' . $e->getMessage()]);
    }
}

// 获取好友在线状态
function getFriendsOnlineStatus() {
    $user_id = checkAuth();
    
    try {
        $pdo = getPDOConnection();
        
        // 获取用户的好友列表，同时检查好友的在线状态可见性设置
        $stmt = $pdo->prepare("
            SELECT f.friend_id, u.username, u.online_status, u.last_active_time, 
                   COALESCE(s.settings, '{}') as user_settings
            FROM friends f
            JOIN users u ON f.friend_id = u.id
            LEFT JOIN user_settings s ON f.friend_id = s.user_id
            WHERE f.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $friends = $stmt->fetchAll();
        
        $onlineStatus = [];
        
        foreach ($friends as $friend) {
            $friend_id = $friend['friend_id'];
            
            // 检查好友是否设置了隐藏在线状态
            $settings = json_decode($friend['user_settings'], true);
            $showOnlineStatus = isset($settings['showOnlineStatus']) ? (bool)$settings['showOnlineStatus'] : true;
            
            // 如果好友设置了隐藏在线状态，则始终显示为离线
            if (!$showOnlineStatus) {
                $onlineStatus[$friend_id] = 'offline';
                continue;
            }
            
            // 根据最后活跃时间计算实际在线状态
            $last_active = new DateTime($friend['last_active_time']);
            $now = new DateTime();
            $diff_minutes = ($now->getTimestamp() - $last_active->getTimestamp()) / 60;
            
            if ($friend['online_status'] === 'online' && $diff_minutes <= 5) {
                $status = 'online'; // 在线
            } elseif ($friend['online_status'] === 'online' && $diff_minutes <= 15) {
                $status = 'away'; // 离开
            } else {
                $status = 'offline'; // 离线
            }
            
            $onlineStatus[$friend_id] = $status;
        }
        
        echo json_encode([
            'success' => true,
            'friendsStatus' => $onlineStatus,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => '获取好友在线状态失败: ' . $e->getMessage()]);
    }
}

// 用户登录时更新状态
function userLogin($user_id) {
    try {
        $pdo = getPDOConnection();
        
        $stmt = $pdo->prepare("UPDATE users SET online_status = 'online', login_time = NOW(), last_active_time = NOW() WHERE id = ?");
        $stmt->execute([$user_id]);
        
        return true;
    } catch (Exception $e) {
        error_log("用户登录状态更新失败: " . $e->getMessage());
        return false;
    }
}

// 用户退出时更新状态
function userLogout($user_id) {
    try {
        $pdo = getPDOConnection();
        
        $stmt = $pdo->prepare("UPDATE users SET online_status = 'offline', logout_time = NOW(), last_active_time = NOW() WHERE id = ?");
        $stmt->execute([$user_id]);
        
        return true;
    } catch (Exception $e) {
        error_log("用户退出状态更新失败: " . $e->getMessage());
        return false;
    }
}

// 心跳检测 - 保持在线状态
function heartbeat() {
    $user_id = checkAuth();
    
    try {
        $pdo = getPDOConnection();
        
        $stmt = $pdo->prepare("UPDATE users SET last_active_time = NOW() WHERE id = ?");
        $stmt->execute([$user_id]);
        
        echo json_encode(['success' => true, 'message' => '心跳检测成功']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => '心跳检测失败: ' . $e->getMessage()]);
    }
}

// 根据路径路由到不同的处理函数
$request_uri = $_SERVER['REQUEST_URI'];
$path_segments = [];

if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $path_segments = array_values(array_filter(explode('/', trim($_SERVER['PATH_INFO'], '/'))));
}

if (empty($path_segments)) {
    $parsed_url = parse_url($request_uri);
    $path = $parsed_url['path'] ?? '';
    
    $prefixes = ['/client-book-vue/api/online_status.php', '/api/online_status.php'];
    
    foreach ($prefixes as $prefix) {
        if (strpos($path, $prefix) === 0) {
            $path = substr($path, strlen($prefix));
            break;
        }
    }
    
    $path_segments = array_values(array_filter(explode('/', trim($path, '/'))));
}

$action = $path_segments[0] ?? '';

switch ($action) {
    case 'update':
        updateOnlineStatus();
        break;
    case 'friends':
        getFriendsOnlineStatus();
        break;
    case 'heartbeat':
        heartbeat();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => '在线状态API端点不存在']);
        break;
}
?>