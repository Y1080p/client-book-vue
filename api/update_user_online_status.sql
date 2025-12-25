-- 为用户表添加在线状态相关字段
ALTER TABLE users 
ADD COLUMN online_status ENUM('online', 'offline', 'away') DEFAULT 'offline' COMMENT '在线状态',
ADD COLUMN last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间',
ADD COLUMN login_time DATETIME DEFAULT NULL COMMENT '登录时间',
ADD COLUMN logout_time DATETIME DEFAULT NULL COMMENT '退出时间';

-- 创建用户在线状态更新触发器（登录时）
DELIMITER //
CREATE TRIGGER update_online_status_on_login
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.login_time IS NOT NULL AND (OLD.login_time IS NULL OR NEW.login_time > OLD.login_time) THEN
        UPDATE users SET online_status = 'online', last_active_time = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END IF;
END //
DELIMITER ;

-- 创建用户在线状态更新触发器（退出时）
DELIMITER //
CREATE TRIGGER update_online_status_on_logout
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.logout_time IS NOT NULL AND (OLD.logout_time IS NULL OR NEW.logout_time > OLD.logout_time) THEN
        UPDATE users SET online_status = 'offline', last_active_time = CURRENT_TIMESTAMP 
        WHERE id = NEW.id;
    END IF;
END //
DELIMITER ;

-- 创建在线状态检查函数（判断用户是否在线）
DELIMITER //
CREATE FUNCTION is_user_online(user_id INT) 
RETURNS ENUM('online', 'offline', 'away')
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE user_status ENUM('online', 'offline', 'away');
    DECLARE last_active DATETIME;
    
    SELECT online_status, last_active_time INTO user_status, last_active
    FROM users WHERE id = user_id;
    
    -- 如果用户状态是在线，但最后活跃时间超过5分钟，则标记为离开
    IF user_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active, NOW()) > 5 THEN
        RETURN 'away';
    ELSE
        RETURN user_status;
    END IF;
END //
DELIMITER ;