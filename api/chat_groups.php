<?php
header('Content-Type: application/json');
// 动态设置允许的源
$allowed_origins = ['http://127.0.0.1:3007', 'http://localhost:3007', 'http://localhost:3000', 'http://127.0.0.1:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// 处理预检请求
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 路由处理 - 兼容 index.php 的路由系统
$request_uri = $_SERVER['REQUEST_URI'];
$path_segments = [];

// 解析路径
if (isset($_SERVER['PATH_INFO']) && !empty($_SERVER['PATH_INFO'])) {
    $path_segments = array_values(array_filter(explode('/', trim($_SERVER['PATH_INFO'], '/'))));
} else {
    $parsed_url = parse_url($request_uri);
    $path = $parsed_url['path'] ?? '';
    
    // 移除前缀
    $prefixes = ['/client-book-vue/api/chat_groups.php', '/client-book-vue/api', '/api'];
    foreach ($prefixes as $prefix) {
        if (strpos($path, $prefix) === 0) {
            $path = substr($path, strlen($prefix));
            break;
        }
    }
    
    $path_segments = array_values(array_filter(explode('/', trim($path, '/'))));
}

$endpoint = $path_segments[0] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

// 引入数据库连接
require_once 'db_connect.php';

// 获取当前用户ID
function getCurrentUserId() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '用户未登录']);
        exit();
    }
    return $_SESSION['user_id'];
}

// 模拟数据库数据（用于测试，如果数据库连接失败时使用）
$chatGroups = [
    [
        'id' => 1,
        'name' => '文学爱好者',
        'member_count' => 156,
        'created_at' => '2024-01-15 10:00:00'
    ],
    [
        'id' => 2,
        'name' => '科幻小说迷',
        'member_count' => 89,
        'created_at' => '2024-01-20 14:30:00'
    ]
];

// 模拟消息数据
$messages = [
    1 => [
        [
            'id' => 1,
            'user_id' => 1,
            'username' => '张三',
            'content' => '大家好！最近有什么好看的文学作品推荐吗？',
            'created_at' => '2024-12-04 09:30:00'
        ]
    ]
];

// 处理不同端点
if ($method === 'GET' && empty($endpoint)) {
    // GET /api/chat/groups - 获取群聊列表
    try {
        $pdo = getPDOConnection();
        $stmt = $pdo->query("SELECT id, group_name as name, group_owner_id, description, max_members, current_members, status, create_time, update_time FROM chat_groups WHERE status = 1");
        $groups = $stmt->fetchAll();
        
        foreach ($groups as &$group) {
            $group['member_count'] = $group['current_members'];
            $group['created_at'] = $group['create_time'];
        }
        
        echo json_encode(['success' => true, 'groups' => $groups]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'groups' => $chatGroups]);
    }
    exit();
}

if ($method === 'POST' && $endpoint === 'create') {
    // POST /api/chat/groups/create - 创建群聊
    getCurrentUserId();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $groupName = $input['group_name'] ?? '';
    $description = $input['description'] ?? '';
    
    if (empty($groupName)) {
        echo json_encode(['success' => false, 'message' => '群聊名称不能为空']);
        exit();
    }
    
    try {
        $pdo = getPDOConnection();
        $currentUserId = $_SESSION['user_id'];
        
        $sql = "INSERT INTO chat_groups (group_name, group_owner_id, description, max_members, current_members, status, create_time, update_time) 
                VALUES (?, ?, ?, 200, 1, 1, NOW(), NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$groupName, $currentUserId, $description]);
        
        $groupId = $pdo->lastInsertId();
        
        // 添加群主到群成员表
        try {
            $stmt = $pdo->prepare("INSERT INTO group_members (group_id, user_id, role, join_time) VALUES (?, ?, 'owner', NOW())");
            $stmt->execute([$groupId, $currentUserId]);
        } catch (Exception $e) {
            // 如果group_members表不存在，忽略错误
        }
        
        echo json_encode(['success' => true, 'message' => '群聊创建成功', 'group_id' => $groupId]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => '创建群聊失败: ' . $e->getMessage()]);
    }
    exit();
}

if ($method === 'GET' && is_numeric($endpoint)) {
    // GET /api/chat/groups/{id}/messages - 获取群聊消息
    $groupId = $endpoint;
    if (isset($messages[$groupId])) {
        echo json_encode(['success' => true, 'messages' => $messages[$groupId]]);
    } else {
        echo json_encode(['success' => true, 'messages' => []]);
    }
    exit();
}

// 默认返回404
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found']);

// 引入数据库连接
require_once 'db_connect.php';

// 获取当前用户ID
function getCurrentUserId() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '用户未登录']);
        exit();
    }
    return $_SESSION['user_id'];
}

// 模拟数据库数据（用于测试，如果数据库连接失败时使用）
$chatGroups = [
    [
        'id' => 1,
        'name' => '文学爱好者',
        'member_count' => 156,
        'created_at' => '2024-01-15 10:00:00'
    ],
    [
        'id' => 2,
        'name' => '科幻小说迷',
        'member_count' => 89,
        'created_at' => '2024-01-20 14:30:00'
    ]
];

// 模拟消息数据
$messages = [
    1 => [
        [
            'id' => 1,
            'user_id' => 1,
            'username' => '张三',
            'content' => '大家好！最近有什么好看的文学作品推荐吗？',
            'created_at' => '2024-12-04 09:30:00'
        ]
    ]
];

// 处理不同端点
if ($method === 'GET' && empty($endpoint)) {
    // GET /api/chat/groups - 获取群聊列表
    try {
        $pdo = getPDOConnection();
        $stmt = $pdo->query("SELECT id, group_name as name, group_owner_id, description, max_members, current_members, status, create_time, update_time FROM chat_groups WHERE status = 1");
        $groups = $stmt->fetchAll();
        
        foreach ($groups as &$group) {
            $group['member_count'] = $group['current_members'];
            $group['created_at'] = $group['create_time'];
        }
        
        echo json_encode(['success' => true, 'groups' => $groups]);
    } catch (Exception $e) {
        echo json_encode(['success' => true, 'groups' => $chatGroups]);
    }
    exit();
}

if ($method === 'POST' && $endpoint === 'create') {
    // POST /api/chat/groups/create - 创建群聊
    getCurrentUserId();
    
    $input = json_decode(file_get_contents('php://input'), true);
    $groupName = $input['group_name'] ?? '';
    $description = $input['description'] ?? '';
    
    if (empty($groupName)) {
        echo json_encode(['success' => false, 'message' => '群聊名称不能为空']);
        exit();
    }
    
    try {
        $pdo = getPDOConnection();
        $currentUserId = $_SESSION['user_id'];
        
        $sql = "INSERT INTO chat_groups (group_name, group_owner_id, description, max_members, current_members, status, create_time, update_time) 
                VALUES (?, ?, ?, 200, 1, 1, NOW(), NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$groupName, $currentUserId, $description]);
        
        $groupId = $pdo->lastInsertId();
        
        // 添加群主到群成员表
        try {
            $stmt = $pdo->prepare("INSERT INTO group_members (group_id, user_id, role, join_time) VALUES (?, ?, 'owner', NOW())");
            $stmt->execute([$groupId, $currentUserId]);
        } catch (Exception $e) {
            // 如果group_members表不存在，忽略错误
        }
        
        echo json_encode(['success' => true, 'message' => '群聊创建成功', 'group_id' => $groupId]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => '创建群聊失败: ' . $e->getMessage()]);
    }
    exit();
}

if ($method === 'GET' && is_numeric($endpoint)) {
    // GET /api/chat/groups/{id}/messages - 获取群聊消息
    $groupId = $endpoint;
    if (isset($messages[$groupId])) {
        echo json_encode(['success' => true, 'messages' => $messages[$groupId]]);
    } else {
        echo json_encode(['success' => true, 'messages' => []]);
    }
    exit();
}

// 默认返回404
http_response_code(404);
echo json_encode(['error' => 'API endpoint not found']);

// 获取当前用户ID
function getCurrentUserId() {
    session_start();
    if (!isset($_SESSION['user_id'])) {
        // 如果没有登录，返回错误
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => '用户未登录']);
        exit();
    }
    return $_SESSION['user_id'];
}

// 模拟数据库数据（用于测试，如果数据库连接失败时使用）
$chatGroups = [
    [
        'id' => 1,
        'name' => '文学爱好者',
        'member_count' => 156,
        'created_at' => '2024-01-15 10:00:00'
    ],
    [
        'id' => 2,
        'name' => '科幻小说迷',
        'member_count' => 89,
        'created_at' => '2024-01-20 14:30:00'
    ],
    [
        'id' => 3,
        'name' => '历史书籍讨论',
        'member_count' => 67,
        'created_at' => '2024-01-25 09:15:00'
    ],
    [
        'id' => 4,
        'name' => '推理小说交流',
        'member_count' => 123,
        'created_at' => '2024-02-01 16:45:00'
    ]
];

// 模拟消息数据
$messages = [
    1 => [
        [
            'id' => 1,
            'user_id' => 1,
            'username' => '张三',
            'content' => '大家好！最近有什么好看的文学作品推荐吗？',
            'created_at' => '2024-12-04 09:30:00'
        ],
        [
            'id' => 2,
            'user_id' => 2,
            'username' => '李四',
            'content' => '我最近在看《百年孤独》，非常推荐！',
            'created_at' => '2024-12-04 09:35:00'
        ],
        [
            'id' => 3,
            'user_id' => 3,
            'username' => '王五',
            'content' => '《追风筝的人》也很不错，情感描写很细腻',
            'created_at' => '2024-12-04 09:40:00'
        ]
    ],
    2 => [
        [
            'id' => 4,
            'user_id' => 4,
            'username' => '赵六',
            'content' => '有人看过《三体》吗？想听听大家的看法',
            'created_at' => '2024-12-04 10:00:00'
        ],
        [
            'id' => 5,
            'user_id' => 5,
            'username' => '钱七',
            'content' => '《三体》的宇宙观真的很宏大，特别是黑暗森林理论',
            'created_at' => '2024-12-04 10:05:00'
        ]
    ]
];

// 获取请求方法
$method = $_SERVER['REQUEST_METHOD'];

// 处理OPTIONS请求（CORS预检）
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 获取请求路径
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathSegments = explode('/', $path);

// 获取最后一个路径段作为端点
$endpoint = end($pathSegments);

// 如果是直接访问chat_groups.php，根据请求方法判断操作
if ($endpoint === 'chat_groups.php') {
    if ($method === 'POST') {
        // 创建群聊
        error_log("🔍 接收到创建群聊请求");
        error_log("🔍 请求方法: " . $method);
        error_log("🔍 请求URI: " . $_SERVER['REQUEST_URI']);
        
        session_start(); // 确保session已启动
        
        // 检查用户是否登录
        if (!isset($_SESSION['user_id'])) {
            error_log("❌ 用户未登录，session user_id: " . ($_SESSION['user_id'] ?? '未设置'));
            echo json_encode(['success' => false, 'message' => '用户未登录']);
            exit();
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        error_log("🔍 接收到的输入数据: " . json_encode($input));
        
        $groupName = $input['group_name'] ?? '';
        $description = $input['description'] ?? '';
        
        if (empty($groupName)) {
            error_log("❌ 群聊名称为空");
            echo json_encode(['success' => false, 'message' => '群聊名称不能为空']);
            exit();
        }
        
        try {
            error_log("🔍 开始数据库操作");
            
            $pdo = getPDOConnection();
            $currentUserId = $_SESSION['user_id'];
            
            error_log("🔍 当前用户ID: " . $currentUserId);
            error_log("🔍 群聊名称: " . $groupName);
            error_log("🔍 群聊描述: " . $description);
            
            // 插入新群聊（使用参考文件的SQL格式）
            $sql = "INSERT INTO chat_groups (group_name, group_owner_id, description, max_members, current_members, status, create_time, update_time) 
                    VALUES (?, ?, ?, 200, 1, 1, NOW(), NOW())";
            error_log("🔍 执行SQL: " . $sql);
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$groupName, $currentUserId, $description]);
            
            $groupId = $pdo->lastInsertId();
            error_log("✅ 群聊创建成功，ID: " . $groupId);
            
            // 检查group_members表是否存在，如果存在则添加群主
            try {
                $stmt = $pdo->prepare("INSERT INTO group_members (group_id, user_id, role, join_time) VALUES (?, ?, 'owner', NOW())");
                $stmt->execute([$groupId, $currentUserId]);
                error_log("✅ 群主添加成功");
            } catch (Exception $e) {
                // 如果group_members表不存在，忽略这个错误
                error_log("添加群成员失败（表可能不存在）: " . $e->getMessage());
            }
            
            echo json_encode(['success' => true, 'message' => '群聊创建成功', 'group_id' => $groupId]);
        } catch (Exception $e) {
            error_log("创建群聊失败: " . $e->getMessage());
            echo json_encode(['success' => false, 'message' => '创建群聊失败: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
    }
    exit();
}

// 处理不同API端点
switch($endpoint) {
    case 'groups':
        // 获取群聊列表
        try {
            $pdo = getPDOConnection();
            $stmt = $pdo->query("SELECT id, group_name as name, group_owner_id, description, max_members, current_members, status, create_time, update_time FROM chat_groups WHERE status = 1");
            $groups = $stmt->fetchAll();
            
            // 格式化数据
            foreach ($groups as &$group) {
                $group['member_count'] = $group['current_members'];
                $group['created_at'] = $group['create_time'];
            }
            
            echo json_encode(['success' => true, 'groups' => $groups]);
        } catch (Exception $e) {
            // 如果数据库连接失败，使用模拟数据
            echo json_encode(['success' => true, 'groups' => $chatGroups]);
        }
        break;
        
    case 'create':
        // 创建群聊
        if ($method === 'POST') {
            // 调试信息
            error_log("🔍 接收到创建群聊请求");
            error_log("🔍 请求方法: " . $method);
            error_log("🔍 请求URI: " . $_SERVER['REQUEST_URI']);
            
            session_start(); // 确保session已启动
            
            // 检查用户是否登录
            if (!isset($_SESSION['user_id'])) {
                error_log("❌ 用户未登录，session user_id: " . ($_SESSION['user_id'] ?? '未设置'));
                echo json_encode(['success' => false, 'message' => '用户未登录']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            error_log("🔍 接收到的输入数据: " . json_encode($input));
            
            $groupName = $input['group_name'] ?? '';
            $description = $input['description'] ?? '';
            
            if (empty($groupName)) {
                error_log("❌ 群聊名称为空");
                echo json_encode(['success' => false, 'message' => '群聊名称不能为空']);
                break;
            }
            
            try {
                error_log("🔍 开始数据库操作");
                
                $pdo = getPDOConnection();
                $currentUserId = $_SESSION['user_id'];
                
                error_log("🔍 当前用户ID: " . $currentUserId);
                error_log("🔍 群聊名称: " . $groupName);
                error_log("🔍 群聊描述: " . $description);
                
                // 插入新群聊（使用参考文件的SQL格式）
                $sql = "INSERT INTO chat_groups (group_name, group_owner_id, description, max_members, current_members, status, create_time, update_time) 
                        VALUES (?, ?, ?, 200, 1, 1, NOW(), NOW())";
                error_log("🔍 执行SQL: " . $sql);
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$groupName, $currentUserId, $description]);
                
                $groupId = $pdo->lastInsertId();
                error_log("✅ 群聊创建成功，ID: " . $groupId);
                
                // 检查group_members表是否存在，如果存在则添加群主
                try {
                    $stmt = $pdo->prepare("INSERT INTO group_members (group_id, user_id, role, join_time) VALUES (?, ?, 'owner', NOW())");
                    $stmt->execute([$groupId, $currentUserId]);
                } catch (Exception $e) {
                    // 如果group_members表不存在，忽略这个错误
                    error_log("添加群成员失败（表可能不存在）: " . $e->getMessage());
                }
                
                echo json_encode(['success' => true, 'message' => '群聊创建成功', 'group_id' => $groupId]);
            } catch (Exception $e) {
                error_log("创建群聊失败: " . $e->getMessage());
                echo json_encode(['success' => false, 'message' => '创建群聊失败: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => '不支持的请求方法']);
        }
        break;
        
    case 'messages':
        // 获取特定群聊的消息
        $groupId = $_GET['group_id'] ?? null;
        if ($groupId && isset($messages[$groupId])) {
            echo json_encode(['success' => true, 'messages' => $messages[$groupId]]);
        } else {
            echo json_encode(['success' => true, 'messages' => []]);
        }
        break;
        
    case 'send':
        // 发送消息
        $input = json_decode(file_get_contents('php://input'), true);
        $groupId = $input['group_id'] ?? null;
        $content = $input['content'] ?? '';
        
        if ($groupId && $content) {
            // 模拟添加新消息
            $newMessage = [
                'id' => time(),
                'user_id' => 1, // 模拟当前用户ID
                'username' => '当前用户',
                'content' => $content,
                'created_at' => date('Y-m-d H:i:s')
            ];
            
            if (!isset($messages[$groupId])) {
                $messages[$groupId] = [];
            }
            
            $messages[$groupId][] = $newMessage;
            echo json_encode(['success' => true, 'message' => '消息发送成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '参数错误']);
        }
        break;
        
    case 'delete':
        // 删除消息
        $input = json_decode(file_get_contents('php://input'), true);
        $messageId = $input['message_id'] ?? null;
        
        if ($messageId) {
            // 模拟删除消息（这里只是演示，实际应该根据权限判断）
            echo json_encode(['success' => true, 'message' => '消息删除成功']);
        } else {
            echo json_encode(['success' => false, 'message' => '参数错误']);
        }
        break;
        
    default:
        // 处理路径如 /chat/groups/1/messages
        if (count($pathSegments) >= 3 && $pathSegments[count($pathSegments)-2] === 'groups') {
            $groupId = $pathSegments[count($pathSegments)-1];
            if ($pathSegments[count($pathSegments)-1] === 'messages') {
                // 获取群聊消息
                if (isset($messages[$groupId])) {
                    echo json_encode(['success' => true, 'messages' => $messages[$groupId]]);
                } else {
                    echo json_encode(['success' => true, 'messages' => []]);
                }
            } else {
                // 获取特定群聊信息
                $group = array_filter($chatGroups, function($group) use ($groupId) {
                    return $group['id'] == $groupId;
                });
                if (!empty($group)) {
                    echo json_encode(['success' => true, 'group' => array_values($group)[0]]);
                } else {
                    echo json_encode(['success' => false, 'message' => '群聊不存在']);
                }
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'API端点不存在']);
        }
        break;
}
?>