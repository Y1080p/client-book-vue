<?php
// 引入数据库配置
require_once 'api/db_connect.php';

try {
    // 获取数据库连接
    $pdo = getPDOConnection();
    
    // 读取SQL文件内容
    $sql = file_get_contents('update_online_status_table.sql');
    
    // 执行SQL语句
    $pdo->exec($sql);
    
    echo "用户在线状态表更新成功！\n";
} catch (PDOException $e) {
    // 如果是列已存在的错误，可以忽略
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "列已存在，无需更新。\n";
    } else {
        echo "更新用户在线状态表失败: " . $e->getMessage() . "\n";
    }
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>