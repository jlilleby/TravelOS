<?php
declare(strict_types=1);

function travel_os_cookie_options(int $lifetime = 0): array {
  return [
    'lifetime' => $lifetime,
    'path' => '/',
    'secure' => defined('COOKIE_SECURE') ? COOKIE_SECURE : false,
    'httponly' => true,
    'samesite' => 'Lax',
  ];
}

function travel_os_start_session(int $lifetime = 0): void {
  session_set_cookie_params(travel_os_cookie_options($lifetime));
  session_start();
}

function travel_os_remember_secret(): string {
  if (defined('REMEMBER_SECRET') && REMEMBER_SECRET !== '') {
    return (string) REMEMBER_SECRET;
  }

  if (defined('APP_PASSWORD_HASH') && APP_PASSWORD_HASH !== '') {
    return (string) APP_PASSWORD_HASH;
  }

  return 'travel-os-remember-secret';
}

function travel_os_issue_remember_cookie(): void {
  if (!defined('APP_PASSWORD_HASH') || APP_PASSWORD_HASH === '') {
    return;
  }

  $token = hash_hmac('sha256', (string) APP_PASSWORD_HASH, travel_os_remember_secret());
  setcookie(
    'travel_os_remember',
    $token,
    time() + (defined('REMEMBER_ME_LIFETIME') ? (int) REMEMBER_ME_LIFETIME : 60 * 60 * 24 * 30),
    '/',
    '',
    defined('COOKIE_SECURE') ? COOKIE_SECURE : false,
    true
  );
}

function travel_os_clear_remember_cookie(): void {
  setcookie('travel_os_remember', '', time() - 3600, '/', '', defined('COOKIE_SECURE') ? COOKIE_SECURE : false, true);
}

function travel_os_has_valid_remember_cookie(): bool {
  $cookie = $_COOKIE['travel_os_remember'] ?? '';
  if (!defined('APP_PASSWORD_HASH') || APP_PASSWORD_HASH === '' || $cookie === '') {
    return false;
  }

  $expected = hash_hmac('sha256', (string) APP_PASSWORD_HASH, travel_os_remember_secret());
  return hash_equals($expected, $cookie);
}

function travel_os_restore_session_from_cookie(): bool {
  if (!empty($_SESSION['travel_os_authenticated'])) {
    return true;
  }

  if (travel_os_has_valid_remember_cookie()) {
    session_regenerate_id(true);
    $_SESSION['travel_os_authenticated'] = true;
    return true;
  }

  return false;
}
