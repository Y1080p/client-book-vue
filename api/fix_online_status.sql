-- 修复在线状态字段的SQL脚本
-- 由于字段已存在，只添加缺失的字段

-- 检查字段是否存在，如果不存在则添加
SET @online_status_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'online_status'
);

SET @last_active_time_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'last_active_time'
);

SET @login_time_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'login_time'
);

SET @logout_time_exists = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'logout_time'
);

-- 只添加不存在的字段
IF @online_status_exists = 0 THEN
    ALTER TABLE users 
    ADD COLUMN online_status ENUM('online', 'offline', 'away') DEFAULT 'offline' COMMENT '在线状态';
END IF;

IF @last_active_time_exists = 0 THEN
    ALTER TABLE users 
    ADD COLUMN last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间';
END IF;

IF @login_time_exists = 0 THEN
    ALTER TABLE users 
    ADD COLUMN login_time DATETIME DEFAULT NULL COMMENT '登录时间';
END IF;

IF @logout_time_exists = 0 THEN
    ALTER TABLE users 
    ADD COLUMN logout_time DATETIME DEFAULT NULL COMMENT '退出时间';
END IF;

-- 更新现有用户的在线状态（如果字段存在）
UPDATE users SET online_status = 'offline' WHERE online_status IS NULL;

-- 创建自动状态更新事件（如果不存在）
DELIMITER //
CREATE EVENT IF NOT EXISTS auto_update_online_status
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    -- 将超过15分钟未活动的在线用户标记为离线
    UPDATE users 
    SET online_status = 'offline' 
    WHERE online_status = 'online' 
    AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) > 15;
    
    -- 将超过5分钟未活动的在线用户标记为离开
    UPDATE users 
    SET online_status = 'away' 
    WHERE online_status = 'online' 
    AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) BETWEEN 6 AND 15;
END //
DELIMITER ;