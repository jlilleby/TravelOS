<?php
require_once __DIR__ . '/auth.php';
travel_os_start_session(0);
$_SESSION = [];
session_destroy();
travel_os_clear_remember_cookie();
if (ini_get('session.use_cookies')) {
  $params = session_get_cookie_params();
  setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
header('Location: login.php');
exit;
