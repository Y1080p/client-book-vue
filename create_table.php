<?php
// 执行SQL创建group_messages表

try {
    // 连接数据库
    $pdo = new PDO('mysql:host=localhost;dbname=book_db', 'root', '123456');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 读取SQL文件
    $sql = file_get_contents('create_group_messages_table.sql');
    
    // 执行SQL
    $pdo->exec($sql);
    
    echo "成功创建group_messages表";
    
} catch (PDOException $e) {
    echo "创建表失败: " . $e->getMessage();
}
?>