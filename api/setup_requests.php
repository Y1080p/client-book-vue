<?php
// 初始化申请列表功能所需的数据库表
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:3011');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../client-book/SQL Connection/db_connect.php';

try {
    $pdo = getPDOConnection();
    $results = [];
    
    // 1. 创建好友申请表
    $sql = "CREATE TABLE IF NOT EXISTS friend_requests (
        id int(11) NOT NULL AUTO_INCREMENT,
        from_user_id int(11) NOT NULL,
        to_user_id int(11) NOT NULL,
        status enum('pending','accepted','rejected') DEFAULT 'pending',
        message text,
        create_time datetime DEFAULT CURRENT_TIMESTAMP,
        process_time datetime DEFAULT NULL,
        PRIMARY KEY (id),
        KEY idx_from_user (from_user_id),
        KEY idx_to_user (to_user_id),
        KEY idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    $results[] = "好友申请表 (friend_requests) 创建成功";
    
    // 2. 创建好友关系表
    $sql = "CREATE TABLE IF NOT EXISTS friends (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        friend_id int(11) NOT NULL,
        create_time datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_friendship (user_id, friend_id),
        KEY idx_user (user_id),
        KEY idx_friend (friend_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    $results[] = "好友关系表 (friends) 创建成功";
    
    // 3. 创建群聊加入申请表
    $sql = "CREATE TABLE IF NOT EXISTS group_join_requests (
        id int(11) NOT NULL AUTO_INCREMENT,
        group_id int(11) NOT NULL,
        user_id int(11) NOT NULL,
        status enum('pending','accepted','rejected') DEFAULT 'pending',
        message text,
        create_time datetime DEFAULT CURRENT_TIMESTAMP,
        process_time datetime DEFAULT NULL,
        PRIMARY KEY (id),
        KEY idx_group (group_id),
        KEY idx_user (user_id),
        KEY idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    $results[] = "群聊加入申请表 (group_join_requests) 创建成功";
    
    // 4. 创建群成员表
    $sql = "CREATE TABLE IF NOT EXISTS group_members (
        id int(11) NOT NULL AUTO_INCREMENT,
        group_id int(11) NOT NULL,
        user_id int(11) NOT NULL,
        role enum('member','admin','owner') DEFAULT 'member',
        join_time datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_membership (group_id, user_id),
        KEY idx_group (group_id),
        KEY idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    $results[] = "群成员表 (group_members) 创建成功";
    
    // 5. 插入一些测试数据
    // 检查是否已有测试数据
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM friend_requests");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        // 插入测试好友申请
        $sql = "INSERT INTO friend_requests (from_user_id, to_user_id, message, create_time) VALUES (?, ?, ?, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([2, 1, '用户2申请添加用户1为好友']);
        $stmt->execute([3, 1, '用户3申请添加用户1为好友']);
        $results[] = "插入测试好友申请成功";
    } else {
        $results[] = "好友申请表已有数据，跳过插入";
    }
    
    // 检查群聊申请表
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM group_join_requests");
    $count = $stmt->fetch()['count'];
    
    if ($count == 0) {
        // 首先检查是否有群聊数据
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM chat_groups");
        $groupCount = $stmt->fetch()['count'];
        
        if ($groupCount > 0) {
            // 插入测试群聊申请
            $sql = "INSERT INTO group_join_requests (group_id, user_id, message, create_time) VALUES (?, ?, ?, NOW())";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([1, 2, '用户2申请加入群聊1']);
            $stmt->execute([1, 3, '用户3申请加入群聊1']);
            $results[] = "插入测试群聊申请成功";
        } else {
            $results[] = "群聊表无数据，跳过插入群聊申请";
        }
    } else {
        $results[] = "群聊申请表已有数据，跳过插入";
    }
    
    echo json_encode([
        'success' => true,
        'results' => $results
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '初始化失败: ' . $e->getMessage()
    ]);
}
?>