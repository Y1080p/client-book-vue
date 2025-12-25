<?php
require_once 'api/db_connect.php';

try {
    $pdo = getPDOConnection();
    
    // 检查group_members表
    $stmt = $pdo->query("SHOW TABLES LIKE 'group_members'");
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "group_members table exists\n";
        
        // 查询所有群成员
        $stmt = $pdo->query("SELECT * FROM group_members");
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "Group members count: " . count($members) . "\n";
        
        foreach ($members as $member) {
            echo "Group ID: " . $member['group_id'] . ", User ID: " . $member['user_id'] . ", Role: " . $member['role'] . "\n";
        }
        
        // 特别查询群ID 20的成员
        echo "\nMembers of group ID 20 (奥特曼交流群):\n";
        $stmt = $pdo->prepare("SELECT * FROM group_members WHERE group_id = 20");
        $stmt->execute();
        $group20Members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($group20Members) > 0) {
            foreach ($group20Members as $member) {
                echo "User ID: " . $member['user_id'] . ", Role: " . $member['role'] . "\n";
            }
        } else {
            echo "No members found in group ID 20\n";
        }
    } else {
        echo "group_members table does not exist\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>