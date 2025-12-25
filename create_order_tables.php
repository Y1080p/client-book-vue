<?php
// 创建订单相关表的PHP脚本

try {
    // 数据库连接配置
    $host = 'localhost';
    $dbname = 'book_db';
    $username = 'root';
    $password = 'root';
    
    // 创建PDO连接
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "开始创建订单相关表...\n";
    
    // 创建订单表
    $createOrdersTable = "
        CREATE TABLE IF NOT EXISTS `orders` (
            `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单ID，自增主键',
            `order_no` varchar(50) NOT NULL COMMENT '订单号',
            `user_id` int(11) NOT NULL COMMENT '用户ID',
            `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
            `status` enum('pending','paid','shipped','completed','cancelled') NOT NULL DEFAULT 'pending' COMMENT '订单状态',
            `address_info` text COMMENT '收货地址信息',
            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            PRIMARY KEY (`id`),
            UNIQUE KEY `order_no_unique` (`order_no`),
            KEY `user_id_index` (`user_id`),
            KEY `status_index` (`status`),
            KEY `create_time_index` (`create_time`),
            CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单表'
    ";
    
    $pdo->exec($createOrdersTable);
    echo "✓ 订单表创建成功\n";
    
    // 创建订单商品表
    $createOrderItemsTable = "
        CREATE TABLE IF NOT EXISTS `order_items` (
            `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '订单商品ID，自增主键',
            `order_id` int(11) NOT NULL COMMENT '订单ID',
            `book_id` int(11) NOT NULL COMMENT '图书ID',
            `quantity` int(11) NOT NULL DEFAULT '1' COMMENT '购买数量',
            `price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '购买时价格',
            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            PRIMARY KEY (`id`),
            KEY `order_id_index` (`order_id`),
            KEY `book_id_index` (`book_id`),
            CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
            CONSTRAINT `fk_order_items_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单商品表'
    ";
    
    $pdo->exec($createOrderItemsTable);
    echo "✓ 订单商品表创建成功\n";
    
    // 创建用户地址表
    $createUserAddressesTable = "
        CREATE TABLE IF NOT EXISTS `user_addresses` (
            `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '地址ID，自增主键',
            `user_id` int(11) NOT NULL COMMENT '用户ID',
            `name` varchar(50) NOT NULL COMMENT '收货人姓名',
            `phone` varchar(20) NOT NULL COMMENT '联系电话',
            `province` varchar(50) DEFAULT NULL COMMENT '省份',
            `city` varchar(50) DEFAULT NULL COMMENT '城市',
            `district` varchar(50) DEFAULT NULL COMMENT '区县',
            `detail_address` varchar(255) NOT NULL COMMENT '详细地址',
            `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否默认地址（1是，0否）',
            `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态（1启用，0禁用）',
            `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            PRIMARY KEY (`id`),
            KEY `user_id_index` (`user_id`),
            KEY `is_default_index` (`is_default`),
            CONSTRAINT `fk_user_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户地址表'
    ";
    
    $pdo->exec($createUserAddressesTable);
    echo "✓ 用户地址表创建成功\n";
    
    echo "所有表创建完成！\n";
    
} catch (PDOException $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>