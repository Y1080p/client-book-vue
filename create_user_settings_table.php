<?php
// 引入数据库配置
require_once 'api/db_connect.php';

try {
    // 获取数据库连接
    $pdo = getPDOConnection();
    
    // 读取SQL文件内容
    $sql = file_get_contents('create_user_settings_table.sql');
    
    // 执行SQL语句
    $pdo->exec($sql);
    
    echo "用户设置表创建成功！\n";
} catch (PDOException $e) {
    echo "创建用户设置表失败: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>