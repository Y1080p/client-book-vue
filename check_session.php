<?php
session_start();

echo "Session data:\n";
print_r($_SESSION);

echo "\nUser ID: " . (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'Not set') . "\n";
echo "Username: " . (isset($_SESSION['username']) ? $_SESSION['username'] : 'Not set') . "\n";
?>