-- 在线状态系统数据库设置脚本
-- 这个脚本将为用户表添加在线状态相关字段

-- 1. 为用户表添加在线状态相关字段
ALTER TABLE users 
ADD COLUMN online_status ENUM('online', 'offline', 'away') DEFAULT 'offline' COMMENT '在线状态',
ADD COLUMN last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后活跃时间',
ADD COLUMN login_time DATETIME DEFAULT NULL COMMENT '登录时间',
ADD COLUMN logout_time DATETIME DEFAULT NULL COMMENT '退出时间';

-- 2. 更新所有现有用户的在线状态为离线
UPDATE users SET online_status = 'offline';

-- 3. 创建在线状态检查视图
CREATE VIEW user_online_status AS
SELECT 
    id,
    username,
    online_status,
    last_active_time,
    CASE 
        WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) <= 5 THEN '在线'
        WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) <= 15 THEN '离开'
        ELSE '离线'
    END as status_text,
    CASE 
        WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) <= 5 THEN 'online'
        WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) <= 15 THEN 'away'
        ELSE 'offline'
    END as actual_status
FROM users;

-- 4. 创建用户活动日志表（可选，用于更详细的活动追踪）
CREATE TABLE IF NOT EXISTS user_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('login', 'logout', 'heartbeat', 'message_sent', 'page_view') NOT NULL,
    activity_details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time),
    INDEX idx_activity_type (activity_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. 创建在线用户统计视图
CREATE VIEW online_users_statistics AS
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) <= 5 THEN 1 ELSE 0 END) as online_users,
    SUM(CASE WHEN online_status = 'online' AND TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) BETWEEN 6 AND 15 THEN 1 ELSE 0 END) as away_users,
    SUM(CASE WHEN online_status = 'offline' OR TIMESTAMPDIFF(MINUTE, last_active_time, NOW()) > 15 THEN 1 ELSE 0 END) as offline_users
FROM users
WHERE status = 1; -- 只统计启用的用户

-- 6. 创建自动状态更新事件（可选，用于自动清理过期用户状态）
DELIMITER //
CREATE EVENT IF NOT EXISTS auto_update_user_status
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

-- 7. 启用事件调度器（如果尚未启用）
SET GLOBAL event_scheduler = ON;

-- 8. 显示设置完成信息
SELECT '在线状态系统数据库设置完成' as status_message;