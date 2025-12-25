<?php
// 数据库连接配置
function getPDOConnection() {
    try {
        $host = 'localhost';
        $dbname = 'book_db';
        $username = 'root';
        $password = 'root'; // 默认密码，根据实际情况修改
        
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        
        return $pdo;
    } catch (PDOException $e) {
        error_log("数据库连接失败: " . $e->getMessage());
        throw new Exception("数据库连接失败: " . $e->getMessage());
    }
}

// 测试数据库连接（可选）
function testConnection() {
    try {
        $pdo = getPDOConnection();
        return $pdo->query("SELECT 1") !== false;
    } catch (Exception $e) {
        return false;
    }
}
?>