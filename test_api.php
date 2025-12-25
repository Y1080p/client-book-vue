<?php
header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'message' => 'API测试成功',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'unknown',
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'SERVER_PORT' => $_SERVER['SERVER_PORT'] ?? 'unknown'
    ]
]);
?>