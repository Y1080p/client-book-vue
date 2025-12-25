<?php
require_once 'api/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    // 模拟当前用户ID为72（奥特曼交流群的群主）
    $userId = 72;
    $groupId = 20;
    
    echo "Testing permission check for user ID: " . $userId . " and group ID: " . $groupId . "\n\n";
    
    // 检查用户是否是群主或成员
    $stmt = $pdo->query("SHOW TABLES LIKE 'group_members'");
    if ($stmt->fetch()) {
        echo "group_members table exists\n";
        
        // 检查用户是否是群主或成员
        $stmt = $pdo->prepare("SELECT id FROM group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $userId]);
        $isMember = $stmt->fetch();
        
        $stmt = $pdo->prepare("SELECT id FROM chat_groups WHERE id = ? AND group_owner_id = ?");
        $stmt->execute([$groupId, $userId]);
        $isOwner = $stmt->fetch();
        
        echo "Is member: " . ($isMember ? 'true' : 'false') . "\n";
        echo "Is owner: " . ($isOwner ? 'true' : 'false') . "\n";
        echo "Has permission: " . (($isMember || $isOwner) ? 'true' : 'false') . "\n";
    } else {
        echo "group_members table does not exist\n";
        
        // group_members表不存在，只检查是否是群主
        $stmt = $pdo->prepare("SELECT id FROM chat_groups WHERE id = ? AND group_owner_id = ?");
        $stmt->execute([$groupId, $userId]);
        $isOwner = $stmt->fetch();
        
        echo "Is owner: " . ($isOwner ? 'true' : 'false') . "\n";
        echo "Has permission: " . ($isOwner ? 'true' : 'false') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>