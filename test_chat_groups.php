<?php
require_once 'api/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    // 模拟当前用户ID为72
    $userId = 72;
    
    echo "Testing query for user ID: " . $userId . "\n\n";
    
    // 测试修改后的查询
    echo "Modified query:\n";
    
    // 检查group_members表是否存在
    $stmt = $pdo->query("SHOW TABLES LIKE 'group_members'");
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "group_members table exists\n";
        
        // 表存在，查询用户所属的群聊
        $sql = "SELECT g.id, g.group_name as name, g.description, 
                CASE 
                    WHEN g.current_members = 0 THEN 1 
                    ELSE g.current_members 
                END as member_count, 
                g.create_time 
                FROM chat_groups g
                LEFT JOIN group_members gm ON g.id = gm.group_id
                WHERE (g.group_owner_id = ? OR gm.user_id = ?) AND g.status = 1
                GROUP BY g.id
                ORDER BY g.create_time DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId, $userId]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Found " . count($groups) . " groups:\n";
        foreach ($groups as $group) {
            echo "Group ID: " . $group['id'] . ", Name: " . $group['name'] . ", Member Count: " . $group['member_count'] . "\n";
        }
    } else {
        echo "group_members table does not exist\n";
        
        // 表不存在，查询用户是群主的群聊
        $sql = "SELECT id, group_name as name, description, 
                CASE 
                    WHEN current_members = 0 THEN 1 
                    ELSE current_members 
                END as member_count, 
                create_time 
                FROM chat_groups 
                WHERE group_owner_id = ? AND status = 1 
                ORDER BY create_time DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Found " . count($groups) . " groups:\n";
        foreach ($groups as $group) {
            echo "Group ID: " . $group['id'] . ", Name: " . $group['name'] . ", Member Count: " . $group['member_count'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>