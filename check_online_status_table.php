<?php
// 引入数据库配置
require_once 'api/db_connect.php';

try {
    // 获取数据库连接
    $pdo = getPDOConnection();
    
    // 检查表是否存在
    $stmt = $pdo->prepare("SHOW TABLES LIKE 'user_online_status'");
    $stmt->execute();
    $tableExists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($tableExists) {
        echo "用户在线状态表已存在\n";
        
        // 显示表结构
        $stmt = $pdo->prepare("DESCRIBE user_online_status");
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "表结构:\n";
        foreach ($columns as $column) {
            echo "- " . $column['Field'] . ": " . $column['Type'] . "\n";
        }
    } else {
        echo "用户在线状态表不存在\n";
        
        // 创建表
        $sql = "CREATE TABLE user_online_status (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            is_online TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否在线',
            is_visible TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否对其他人显示在线状态',
            last_seen TIMESTAMP NULL DEFAULT NULL COMMENT '最后在线时间',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        
        $pdo->exec($sql);
        echo "用户在线状态表创建成功！\n";
    }
} catch (PDOException $e) {
    echo "错误: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>