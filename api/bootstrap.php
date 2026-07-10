<?php
declare(strict_types=1);

require_once __DIR__ . '/../auth.php';
travel_os_start_session(defined('SESSION_LIFETIME') ? SESSION_LIFETIME : 0);
travel_os_restore_session_from_cookie();

$configPath = __DIR__ . '/../config.php';
if (!file_exists($configPath)) {
  http_response_code(500);
  header('Content-Type: application/json');
  echo json_encode(['error' => 'Missing config.php. Copy config.example.php to config.php.']);
  exit;
}
require_once $configPath;

function require_auth(): void {
  if (empty($_SESSION['travel_os_authenticated'])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Not authenticated']);
    exit;
  }
}

function db(): PDO {
  static $pdo = null;
  if ($pdo instanceof PDO) return $pdo;
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  return $pdo;
}

function ensure_packing_category_column(): void {
  $pdo = db();
  try {
    $pdo->query('SELECT category FROM packing_items LIMIT 1');
  } catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Unknown column') !== false && strpos($e->getMessage(), 'category') !== false) {
      $pdo->exec('ALTER TABLE packing_items ADD COLUMN category VARCHAR(100) NULL');
    } else {
      throw $e;
    }
  }
}
function ensure_event_display_mode_column(): void {
  $pdo = db();
  try {
    $pdo->query('SELECT display_mode FROM events LIMIT 1');
  } catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Unknown column') !== false && strpos($e->getMessage(), 'display_mode') !== false) {
      $pdo->exec("ALTER TABLE events ADD COLUMN display_mode VARCHAR(20) NOT NULL DEFAULT 'single'");
    } else {
      throw $e;
    }
  }
}
function ensure_saved_views_table(): void {
  $pdo = db();
  $pdo->exec("CREATE TABLE IF NOT EXISTS saved_views (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    trip_id INT NULL,
    name VARCHAR(100) NOT NULL,
    view_type VARCHAR(50) NOT NULL DEFAULT 'timeline',
    filter_json JSON NOT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_saved_views_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_saved_views_scope (user_id, trip_id, view_type),
    INDEX idx_saved_views_default (user_id, is_default)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}
ensure_packing_category_column();
ensure_event_display_mode_column();
ensure_saved_views_table();

function generate_uuid_v4(): string {
  $bytes = random_bytes(16);
  $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
  $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
  $hex = bin2hex($bytes);
  return sprintf('%s-%s-%s-%s-%s', substr($hex, 0, 8), substr($hex, 8, 4), substr($hex, 12, 4), substr($hex, 16, 4), substr($hex, 20, 12));
}

function current_user_id(): string {
  if (!empty($_SESSION['travel_os_user_id'])) return (string) $_SESSION['travel_os_user_id'];
  $seed = defined('APP_PASSWORD_HASH') ? (string) APP_PASSWORD_HASH : session_id();
  $hash = sha1('travel-os-user:' . $seed);
  $_SESSION['travel_os_user_id'] = sprintf('%s-%s-%s-%s-%s', substr($hash, 0, 8), substr($hash, 8, 4), substr($hash, 12, 4), substr($hash, 16, 4), substr($hash, 20, 12));
  return (string) $_SESSION['travel_os_user_id'];
}

function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function input_json(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '{}', true);
  return is_array($data) ? $data : [];
}
function method(): string { return $_SERVER['REQUEST_METHOD'] ?? 'GET'; }
function int_param(string $name, ?int $default = null): ?int { return isset($_GET[$name]) ? (int)$_GET[$name] : $default; }
function clean_string($value, int $max = 1000): ?string {
  if ($value === null) return null;
  $s = trim((string)$value);
  if ($s === '') return null;
  return mb_substr($s, 0, $max);
}
function allowed_upload_extension(string $filename): bool {
  $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
  return in_array($ext, ALLOWED_EXTENSIONS, true);
}
