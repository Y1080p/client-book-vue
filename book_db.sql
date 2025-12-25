/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80012
 Source Host           : localhost:3306
 Source Schema         : book_db

 Target Server Type    : MySQL
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 06/12/2025 00:10:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for book_tags
-- ----------------------------
DROP TABLE IF EXISTS `book_tags`;
CREATE TABLE `book_tags`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '关联ID，自增主键',
  `book_id` int(11) NOT NULL COMMENT '图书ID',
  `tag_id` int(11) NOT NULL COMMENT '标签ID',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `book_tag_unique`(`book_id`, `tag_id`) USING BTREE,
  INDEX `book_id_index`(`book_id`) USING BTREE,
  INDEX `tag_id_index`(`tag_id`) USING BTREE,
  CONSTRAINT `fk_book_tags_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_book_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书标签关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of book_tags
-- ----------------------------

-- ----------------------------
-- Table structure for books
-- ----------------------------
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '图书ID，自增主键',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '图书标题',
  `author` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '作者',
  `isbn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'ISBN号',
  `publisher` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '出版社',
  `publish_date` date NULL DEFAULT NULL COMMENT '出版日期',
  `category_id` int(11) NOT NULL COMMENT '分类ID',
  `cover_image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '封面图片',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '图书描述',
  `price` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '价格',
  `stock` int(11) NULL DEFAULT 0 COMMENT '库存数量',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1上架，0下架）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `category_id_index`(`category_id`) USING BTREE,
  INDEX `author_index`(`author`) USING BTREE,
  INDEX `title_index`(`title`) USING BTREE,
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 36 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of books
-- ----------------------------
INSERT INTO `books` VALUES (11, '三体', '刘慈欣', '9787536692930', '重庆出版社', '2008-01-01', 1, '../image/book-icon.png', '科幻小说经典之作，讲述了人类与三体文明接触的故事', 45.00, 100, 1, '2025-11-11 15:37:32', '2025-12-06 00:09:05');
INSERT INTO `books` VALUES (12, 'JavaScript高级程序设计', 'Nicholas C. Zakas', '9787115275790', '人民邮电出版社', '2012-03-01', 2, '../image/book-icon.png', '前端开发必读经典，全面讲解JavaScript核心技术', 89.00, 50, 1, '2025-11-11 15:37:32', '2025-12-06 00:09:06');
INSERT INTO `books` VALUES (13, '人类简史', '尤瓦尔·赫拉利', '9787508647357', '中信出版社', '2014-11-01', 3, '../image/book-icon.png', '从动物到上帝的人类历史，视角独特的历史著作', 68.00, 80, 1, '2025-11-11 15:37:32', '2025-11-12 19:29:00');
INSERT INTO `books` VALUES (14, '经济学原理', 'N.格里高利·曼昆', '9787301256911', '北京大学出版社', '2015-05-01', 4, '../image/book-icon.png', '经济学入门经典教材，通俗易懂的经济学原理', 88.00, 60, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:58');
INSERT INTO `books` VALUES (15, '设计中的设计', '原研哉', '9787530946197', '山东人民出版社', '2006-11-01', 5, '../image/book-icon.png', '设计思维与美学，日本设计大师原研哉的代表作', 48.00, 40, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:56');
INSERT INTO `books` VALUES (16, '活着', '余华', '9787506365437', '作家出版社', '2012-08-01', 1, '../image/book-icon.png', '中国当代文学经典，讲述了一个普通人的苦难人生', 35.00, 120, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:54');
INSERT INTO `books` VALUES (17, 'Python编程：从入门到实践', 'Eric Matthes', '9787115428028', '人民邮电出版社', '2016-07-01', 2, '../image/book-icon.png', 'Python编程入门教程，适合零基础学习者', 79.00, 70, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:52');
INSERT INTO `books` VALUES (18, '明朝那些事儿', '当年明月', '9787801656087', '中国友谊出版公司', '2006-09-01', 3, '../image/book-icon.png', '通俗易懂的明朝历史，用现代语言讲述古代故事', 29.80, 150, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:50');
INSERT INTO `books` VALUES (19, '穷查理宝典', '查理·芒格', '9787208111335', '上海人民出版社', '2010-10-01', 4, '../image/book-icon.png', '投资大师查理·芒格的智慧箴言和投资哲学', 88.00, 45, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:48');
INSERT INTO `books` VALUES (20, '艺术的故事', 'E.H.贡布里希', '9787108018078', '广西美术出版社', '2008-04-01', 5, '../image/book-icon.png', '艺术史经典著作，全面介绍西方艺术发展历程', 280.00, 30, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:46');
INSERT INTO `books` VALUES (21, '百年孤独', '加西亚·马尔克斯', '9787544253994', '南海出版公司', '2011-06-01', 1, '../image/book-icon.png', '魔幻现实主义文学代表作，布恩迪亚家族七代传奇', 39.50, 90, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:45');
INSERT INTO `books` VALUES (22, '算法导论', 'Thomas H. Cormen', '9787111407010', '机械工业出版社', '2012-12-01', 2, '../image/book-icon.png', '计算机算法经典教材，程序员必读之作', 128.00, 35, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:43');
INSERT INTO `books` VALUES (23, '史记', '司马迁', '9787101003048', '中华书局', '1982-11-01', 3, '../image/book-icon.png', '中国第一部纪传体通史，记载了从黄帝到汉武帝的历史', 198.00, 25, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:42');
INSERT INTO `books` VALUES (24, '国富论', '亚当·斯密', '9787100040981', '商务印书馆', '1972-12-01', 4, '../image/book-icon.png', '经济学奠基之作，现代经济学的开山之作', 48.00, 60, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:40');
INSERT INTO `books` VALUES (25, '美的历程', '李泽厚', '9787108017200', '文物出版社', '1981-03-01', 5, '../image/book-icon.png', '中国美学史经典著作，梳理中国美学发展脉络', 36.00, 55, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:38');
INSERT INTO `books` VALUES (26, '围城', '钱钟书', '9787020090006', '人民文学出版社', '1991-02-01', 1, '../image/book-icon.png', '中国现代文学经典，讽刺知识分子生活的小说', 28.00, 110, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:36');
INSERT INTO `books` VALUES (27, '计算机网络', 'Andrew S. Tanenbaum', '9787115175627', '清华大学出版社', '2008-06-01', 2, '../image/book-icon.png', '计算机网络经典教材，全面讲解网络技术原理', 69.00, 65, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:34');
INSERT INTO `books` VALUES (28, '全球通史', '斯塔夫里阿诺斯', '9787301117749', '北京大学出版社', '2006-10-01', 3, '../image/book-icon.png', '世界历史通史著作，从全球视角看人类文明发展', 96.00, 40, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:32');
INSERT INTO `books` VALUES (29, '货币战争', '宋鸿兵', '9787508612089', '中信出版社', '2007-06-01', 4, '../image/book-icon.png', '金融阴谋论著作，揭秘国际金融资本运作', 38.00, 85, 1, '2025-11-11 15:37:32', '2025-11-12 19:28:30');
INSERT INTO `books` VALUES (30, '摄影构图学', '本·克莱门茨', '9787115178888', '人民邮电出版社', '2015-08-01', 5, '../image/book-icon.png', '摄影构图理论经典，提升摄影技巧的实用指南', 58.00, 75, 1, '2025-11-11 15:37:32', '2025-11-12 19:19:54');
INSERT INTO `books` VALUES (31, '红楼梦', '曹雪芹', '9787501384150', '国家图书馆出版社', NULL, 6, '../image/book-icon.png', NULL, 60.00, 100, 1, '2025-11-12 20:49:51', '2025-11-12 20:58:44');
INSERT INTO `books` VALUES (32, '三国演义', '罗贯中', '9787570207510', '长江文艺出版社', NULL, 6, '../image/book-icon.png', NULL, 50.00, 50, 1, '2025-11-12 20:50:41', '2025-11-12 20:58:45');
INSERT INTO `books` VALUES (33, '水浒传', '施耐庵', '1008643564564', '江苏凤凰文艺出版社', NULL, 6, '../image/book-icon.png', NULL, 55.00, 60, 1, '2025-11-12 20:51:30', '2025-12-06 00:08:44');
INSERT INTO `books` VALUES (34, '西游记', '吴承恩', '9787501380527', '国家图书馆出版社', NULL, 6, '../image/book-icon.png', NULL, 70.00, 80, 1, '2025-11-12 20:53:03', '2025-11-12 20:59:45');
INSERT INTO `books` VALUES (35, '小王子', '埃克苏佩里', '9787533955874', '浙江文艺出版社', NULL, 1, '../image/book-icon.png', NULL, 59.00, 25, 1, '2025-11-12 20:58:27', '2025-11-12 20:58:27');

-- ----------------------------
-- Table structure for cart
-- ----------------------------
DROP TABLE IF EXISTS `cart`;
CREATE TABLE `cart`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_book`(`user_id`, `book_id`) USING BTREE,
  INDEX `book_id`(`book_id`) USING BTREE,
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 50 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cart
-- ----------------------------
INSERT INTO `cart` VALUES (1, 14, 13, 2, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (2, 14, 14, 5, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (3, 12, 15, 3, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (4, 10, 16, 5, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (5, 13, 17, 2, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (6, 13, 18, 4, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (7, 12, 19, 4, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (8, 14, 20, 1, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (9, 10, 21, 1, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (10, 12, 22, 5, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (11, 13, 23, 3, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (12, 14, 24, 4, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (13, 12, 25, 1, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (14, 12, 26, 1, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (15, 14, 27, 5, '2025-11-12 22:32:47', '2025-11-12 22:32:47');
INSERT INTO `cart` VALUES (16, 10, 35, 1, '2025-11-12 22:34:30', '2025-11-12 22:34:30');
INSERT INTO `cart` VALUES (33, 40, 35, 1, '2025-12-04 19:53:02', '2025-12-04 19:53:02');
INSERT INTO `cart` VALUES (47, 4, 35, 1, '2025-12-05 13:28:20', '2025-12-05 13:28:20');
INSERT INTO `cart` VALUES (48, 4, 34, 1, '2025-12-05 13:28:51', '2025-12-05 13:28:51');
INSERT INTO `cart` VALUES (49, 4, 33, 1, '2025-12-05 13:28:53', '2025-12-05 13:28:53');

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '分类ID，自增主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '分类描述',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1启用，0禁用）',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name_unique`(`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of categories
-- ----------------------------
INSERT INTO `categories` VALUES (1, '文学小说', '各类文学作品和小说', 1, 1, '2025-11-05 17:20:41', '2025-11-11 11:21:45');
INSERT INTO `categories` VALUES (2, '科学技术', '科技、计算机、工程类书籍', 1, 2, '2025-11-05 17:20:41', '2025-11-05 17:20:41');
INSERT INTO `categories` VALUES (3, '历史传记', '历史事件和人物传记', 1, 3, '2025-11-05 17:20:41', '2025-11-05 17:20:41');
INSERT INTO `categories` VALUES (4, '经济管理', '经济学和管理学书籍', 1, 4, '2025-11-05 17:20:41', '2025-11-05 17:20:41');
INSERT INTO `categories` VALUES (5, '生活艺术', '生活、艺术、设计类书籍', 1, 5, '2025-11-05 17:20:41', '2025-11-05 17:20:41');
INSERT INTO `categories` VALUES (6, '四大名著', '中国四大名著', 1, 6, '2025-11-11 08:42:51', '2025-11-11 08:43:07');

-- ----------------------------
-- Table structure for chat_groups
-- ----------------------------
DROP TABLE IF EXISTS `chat_groups`;
CREATE TABLE `chat_groups`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '群聊ID，自增主键',
  `group_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '群聊名称',
  `group_owner_id` int(11) NOT NULL COMMENT '群主ID',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '群聊描述',
  `max_members` int(11) NULL DEFAULT 200 COMMENT '最大成员数',
  `current_members` int(11) NULL DEFAULT 0 COMMENT '当前成员数',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1正常，0关闭）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `group_owner_index`(`group_owner_id`) USING BTREE,
  CONSTRAINT `fk_chat_groups_owner` FOREIGN KEY (`group_owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '群聊表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chat_groups
-- ----------------------------
INSERT INTO `chat_groups` VALUES (12, '文学爱好者交流群', 1, '文学小说爱好者交流群，分享阅读心得和好书推荐', 200, 45, 1, '2025-11-11 12:03:51', '2025-11-11 20:59:26');
INSERT INTO `chat_groups` VALUES (13, '历史研究小组', 3, '历史事件和人物研究讨论群', 50, 18, 1, '2025-11-11 12:03:51', '2025-12-05 17:47:21');
INSERT INTO `chat_groups` VALUES (14, '经济学学习群', 4, '经济学原理和实践学习交流群', 150, 67, 1, '2025-11-11 12:03:51', '2025-11-11 20:50:18');
INSERT INTO `chat_groups` VALUES (15, '艺术设计交流群', 1, '生活艺术、设计创意交流群', 80, 25, 1, '2025-11-11 12:03:51', '2025-11-11 18:00:28');
INSERT INTO `chat_groups` VALUES (16, '读书分享会', 3, '每月好书推荐和阅读心得分享', 120, 56, 1, '2025-11-11 12:03:51', '2025-11-11 12:03:51');
INSERT INTO `chat_groups` VALUES (19, '龙族交流群', 4, '1111111', 200, 0, 1, '2025-11-11 18:14:45', '2025-12-05 17:47:22');

-- ----------------------------
-- Table structure for chat_messages
-- ----------------------------
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '消息ID，自增主键',
  `user_id` int(11) NOT NULL COMMENT '发送用户ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `message_type` tinyint(1) NULL DEFAULT 1 COMMENT '消息类型（1文本，2图片，3文件）',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件路径',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1正常，0删除）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id_index`(`user_id`) USING BTREE,
  CONSTRAINT `fk_chat_messages_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '群聊消息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of chat_messages
-- ----------------------------
INSERT INTO `chat_messages` VALUES (1, 1, '每日好书推荐', 1, NULL, 1, '2025-11-05 17:20:41');
INSERT INTO `chat_messages` VALUES (3, 3, '前端开发相关籍推荐', 1, NULL, 1, '2025-11-05 17:20:41');
INSERT INTO `chat_messages` VALUES (4, 4, '《经济学原理》这本书很适合入门', 1, NULL, 1, '2025-11-05 17:20:41');

-- ----------------------------
-- Table structure for comments
-- ----------------------------
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '评论ID，自增主键',
  `book_id` int(11) NOT NULL COMMENT '图书ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论内容',
  `rating` tinyint(1) NULL DEFAULT 5 COMMENT '评分（1-5）',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1显示，0隐藏）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `book_id_index`(`book_id`) USING BTREE,
  INDEX `user_id_index`(`user_id`) USING BTREE,
  CONSTRAINT `fk_comments_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书评论表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comments
-- ----------------------------

-- ----------------------------
-- Table structure for friend_requests
-- ----------------------------
DROP TABLE IF EXISTS `friend_requests`;
CREATE TABLE `friend_requests`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_request`(`from_user_id`, `to_user_id`) USING BTREE,
  INDEX `idx_from_user`(`from_user_id`) USING BTREE,
  INDEX `idx_to_user`(`to_user_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of friend_requests
-- ----------------------------
INSERT INTO `friend_requests` VALUES (1, 4, 10, NULL, 'pending', '2025-12-05 15:58:12', '2025-12-05 15:58:12');
INSERT INTO `friend_requests` VALUES (2, 4, 4, NULL, 'accepted', '2025-12-05 16:18:43', '2025-12-05 22:57:54');
INSERT INTO `friend_requests` VALUES (3, 11, 11, NULL, 'pending', '2025-12-05 16:57:30', '2025-12-05 16:57:30');
INSERT INTO `friend_requests` VALUES (4, 11, 4, NULL, 'accepted', '2025-12-05 17:00:47', '2025-12-05 22:58:08');
INSERT INTO `friend_requests` VALUES (5, 12, 4, NULL, 'accepted', '2025-12-05 17:12:16', '2025-12-05 22:58:12');
INSERT INTO `friend_requests` VALUES (6, 10, 4, NULL, 'accepted', '2025-12-05 19:07:06', '2025-12-05 22:58:15');
INSERT INTO `friend_requests` VALUES (7, 4, 11, NULL, 'pending', '2025-12-05 19:26:30', '2025-12-05 19:26:30');
INSERT INTO `friend_requests` VALUES (8, 1, 13, NULL, 'pending', '2025-12-05 19:35:32', '2025-12-05 19:35:32');
INSERT INTO `friend_requests` VALUES (9, 1, 14, NULL, 'pending', '2025-12-05 19:58:00', '2025-12-05 19:58:00');
INSERT INTO `friend_requests` VALUES (10, 4, 37, NULL, 'accepted', '2025-12-05 21:19:04', '2025-12-05 22:16:44');
INSERT INTO `friend_requests` VALUES (11, 13, 37, NULL, 'accepted', '2025-12-05 21:29:34', '2025-12-05 22:16:17');
INSERT INTO `friend_requests` VALUES (12, 37, 4, NULL, 'accepted', '2025-12-05 22:57:43', '2025-12-05 22:58:17');

-- ----------------------------
-- Table structure for friends
-- ----------------------------
DROP TABLE IF EXISTS `friends`;
CREATE TABLE `friends`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `user_id`(`user_id`, `friend_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of friends
-- ----------------------------
INSERT INTO `friends` VALUES (1, 37, 13, '2025-12-05 22:16:17');
INSERT INTO `friends` VALUES (2, 13, 37, '2025-12-05 22:16:17');
INSERT INTO `friends` VALUES (3, 37, 4, '2025-12-05 22:16:44');
INSERT INTO `friends` VALUES (4, 4, 37, '2025-12-05 22:16:44');
INSERT INTO `friends` VALUES (5, 4, 4, '2025-12-05 22:57:54');
INSERT INTO `friends` VALUES (7, 4, 11, '2025-12-05 22:58:08');
INSERT INTO `friends` VALUES (8, 11, 4, '2025-12-05 22:58:08');
INSERT INTO `friends` VALUES (9, 4, 12, '2025-12-05 22:58:12');
INSERT INTO `friends` VALUES (10, 12, 4, '2025-12-05 22:58:12');
INSERT INTO `friends` VALUES (11, 4, 10, '2025-12-05 22:58:15');
INSERT INTO `friends` VALUES (12, 10, 4, '2025-12-05 22:58:15');

-- ----------------------------
-- Table structure for group_join_requests
-- ----------------------------
DROP TABLE IF EXISTS `group_join_requests`;
CREATE TABLE `group_join_requests`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('pending','accepted','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'pending',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_request`(`group_id`, `user_id`) USING BTREE,
  INDEX `idx_group`(`group_id`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_status`(`status`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of group_join_requests
-- ----------------------------
INSERT INTO `group_join_requests` VALUES (1, 16, 4, NULL, 'pending', '2025-12-05 15:58:51', '2025-12-05 15:58:51');

-- ----------------------------
-- Table structure for group_members
-- ----------------------------
DROP TABLE IF EXISTS `group_members`;
CREATE TABLE `group_members`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('owner','admin','member') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'member',
  `join_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_member`(`group_id`, `user_id`) USING BTREE,
  INDEX `idx_group`(`group_id`) USING BTREE,
  INDEX `idx_user`(`user_id`) USING BTREE,
  INDEX `idx_role`(`role`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of group_members
-- ----------------------------

-- ----------------------------
-- Table structure for private_messages
-- ----------------------------
DROP TABLE IF EXISTS `private_messages`;
CREATE TABLE `private_messages`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '私聊消息ID，自增主键',
  `from_user_id` int(11) NOT NULL COMMENT '发送用户ID',
  `to_user_id` int(11) NOT NULL COMMENT '接收用户ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `message_type` tinyint(1) NULL DEFAULT 1 COMMENT '消息类型（1文本，2图片，3文件）',
  `file_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '文件路径',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1正常，0删除）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_from_user`(`from_user_id`) USING BTREE,
  INDEX `idx_to_user`(`to_user_id`) USING BTREE,
  INDEX `idx_conversation`(`from_user_id`, `to_user_id`) USING BTREE,
  INDEX `idx_create_time`(`create_time`) USING BTREE,
  INDEX `idx_conversation_time`(`from_user_id`, `to_user_id`, `create_time`) USING BTREE,
  CONSTRAINT `fk_private_messages_from_user` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_private_messages_to_user` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '私聊消息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of private_messages
-- ----------------------------
INSERT INTO `private_messages` VALUES (1, 4, 10, '你好，111！', 1, NULL, 1, '2025-12-05 23:00:00');
INSERT INTO `private_messages` VALUES (2, 10, 4, '你好，admin！很高兴认识你', 1, NULL, 1, '2025-12-05 23:01:00');
INSERT INTO `private_messages` VALUES (3, 4, 11, '你好，1！', 1, NULL, 1, '2025-12-05 23:02:00');
INSERT INTO `private_messages` VALUES (4, 4, 12, '你好，a！', 1, NULL, 1, '2025-12-05 23:03:00');
INSERT INTO `private_messages` VALUES (5, 4, 37, '你好，qqq！', 1, NULL, 1, '2025-12-05 23:04:00');

-- ----------------------------
-- Table structure for tags
-- ----------------------------
DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '标签ID，自增主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '标签名称',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '#409eff' COMMENT '标签颜色',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1启用，0禁用）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name_unique`(`name`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '图书标签表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tags
-- ----------------------------
INSERT INTO `tags` VALUES (1, '热门', '#f56c6c', 0, '2025-11-05 17:20:41');
INSERT INTO `tags` VALUES (2, '新书', '#67c23a', 0, '2025-11-05 17:20:41');
INSERT INTO `tags` VALUES (3, '经典', '#e6a23c', 0, '2025-11-05 17:20:41');
INSERT INTO `tags` VALUES (4, '推荐', '#409eff', 1, '2025-11-05 17:20:41');
INSERT INTO `tags` VALUES (5, '限时优惠', '#f56c6c', 1, '2025-11-05 17:20:41');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户ID，自增主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户账号，唯一',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '手机号',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '用户状态（1启用，0禁用）',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像地址',
  `gender` tinyint(1) NULL DEFAULT 0 COMMENT '性别（0未知，1男，2女）',
  `intro` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '个人简介',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '普通用户' COMMENT '角色（admin为管理员，user为普通用户）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username_unique`(`username`) USING BTREE,
  INDEX `phone_index`(`phone`) USING BTREE,
  INDEX `email_index`(`email`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 42 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'yjm', '123456', '', '', 1, 'images/avatar1.jpg', 1, '', '员工', '2025-11-05 17:20:41');
INSERT INTO `users` VALUES (3, 'sleepduck', 'sleep123', '', '', 1, 'images/avatar3.jpg', 0, '', '员工', '2025-11-05 17:20:41');
INSERT INTO `users` VALUES (4, 'admin', 'admin123', '', 'admin@example.com', 1, 'images/avatar4.jpg', 0, '系统管理员', 'admin', '2025-11-05 17:20:41');
INSERT INTO `users` VALUES (10, '111', '111', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-05 19:52:35');
INSERT INTO `users` VALUES (11, '1', '1', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-05 19:54:55');
INSERT INTO `users` VALUES (12, 'a', 'a', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-05 19:56:55');
INSERT INTO `users` VALUES (13, '222', '222', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-05 19:58:13');
INSERT INTO `users` VALUES (14, '444', '444', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-05 19:59:28');
INSERT INTO `users` VALUES (16, 'bbb', 'bbb', NULL, NULL, 1, NULL, 0, NULL, '用户', '2025-11-05 20:22:35');
INSERT INTO `users` VALUES (17, '321', '321', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-11 09:33:38');
INSERT INTO `users` VALUES (22, 'aaa', 'aaa', NULL, NULL, 1, NULL, 0, NULL, '用户', '2025-11-11 11:48:38');
INSERT INTO `users` VALUES (36, 'add', 'add', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-11 16:33:49');
INSERT INTO `users` VALUES (37, 'qqq', 'qqq', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-11 16:34:00');
INSERT INTO `users` VALUES (38, 'www', 'www', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-11-11 16:34:10');
INSERT INTO `users` VALUES (39, '1234', '1234', NULL, '1234@qq.com', 1, NULL, 0, NULL, 'user', '2025-11-12 16:50:54');
INSERT INTO `users` VALUES (40, 'ad', 'ad', NULL, NULL, 1, NULL, 0, NULL, '员工', '2025-12-04 19:39:08');
INSERT INTO `users` VALUES (41, 'test', '$2y$10$o/rrmujoDvh1MMABgw3LOOeGsDS5ORGtsSPIQMC1LcMFIaHU/wUMS', NULL, 'test@example.com', 1, NULL, 0, NULL, 'user', '2025-12-05 15:05:58');

-- ----------------------------
-- Table structure for wishlist
-- ----------------------------
DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE `wishlist`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `create_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_user_book`(`user_id`, `book_id`) USING BTREE,
  INDEX `book_id`(`book_id`) USING BTREE,
  CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 38 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of wishlist
-- ----------------------------
INSERT INTO `wishlist` VALUES (3, 10, 13, '2025-11-12 20:24:57');
INSERT INTO `wishlist` VALUES (5, 10, 14, '2025-11-12 20:34:39');
INSERT INTO `wishlist` VALUES (6, 10, 15, '2025-11-12 20:34:41');
INSERT INTO `wishlist` VALUES (36, 4, 35, '2025-12-05 00:30:34');
INSERT INTO `wishlist` VALUES (37, 4, 34, '2025-12-05 13:27:32');

-- ----------------------------
-- Triggers structure for table books
-- ----------------------------
DROP TRIGGER IF EXISTS `auto_fill_cover_image`;
delimiter ;;
CREATE TRIGGER `auto_fill_cover_image` BEFORE INSERT ON `books` FOR EACH ROW BEGIN
    SET NEW.cover_image = '../image/book-icon.png';
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
