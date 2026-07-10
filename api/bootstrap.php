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
ensure_packing_category_column();
ensure_event_display_mode_column();

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
