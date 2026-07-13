<?php
require_once __DIR__ . '/bootstrap.php';
require_auth();

$pdo = db();
$userId = current_user_id();

if (!is_saved_views_enabled()) {
  json_response(['error' => 'Saved views is disabled by feature flag'], 404);
}

function saved_view_row(array $row): array {
  $row['filters'] = $row['filter_json'] ? json_decode($row['filter_json'], true) : [];
  unset($row['filter_json']);
  return $row;
}

if (method() === 'GET') {
  $tripId = int_param('trip_id');
  $viewType = clean_string($_GET['view_type'] ?? 'timeline', 50) ?: 'timeline';
  if ($tripId) {
    $statement = $pdo->prepare('SELECT id,user_id,trip_id,name,view_type,filter_json,is_default,created_at,updated_at FROM saved_views WHERE user_id=? AND view_type=? AND trip_id=? ORDER BY is_default DESC, updated_at DESC, name ASC');
    $statement->execute([$userId, $viewType, $tripId]);
  } else {
    $statement = $pdo->prepare('SELECT id,user_id,trip_id,name,view_type,filter_json,is_default,created_at,updated_at FROM saved_views WHERE user_id=? AND view_type=? ORDER BY is_default DESC, updated_at DESC, name ASC');
    $statement->execute([$userId, $viewType]);
  }
  json_response(array_map('saved_view_row', $statement->fetchAll()));
}

if (method() === 'POST') {
  $data = input_json();
  $tripId = (int) ($data['trip_id'] ?? 0) ?: null;
  $viewType = clean_string($data['view_type'] ?? 'timeline', 50) ?: 'timeline';
  $name = clean_string($data['name'] ?? null, 100) ?: 'Ny visning';
  $filters = json_encode($data['filter_json'] ?? $data['filters'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $isDefault = !empty($data['is_default']) ? 1 : 0;
  $id = generate_uuid_v4();
  if ($isDefault) {
    $reset = $pdo->prepare('UPDATE saved_views SET is_default=0 WHERE user_id=? AND view_type=? AND trip_id <=> ?');
    $reset->execute([$userId, $viewType, $tripId]);
  }
  $statement = $pdo->prepare('INSERT INTO saved_views (id,user_id,trip_id,name,view_type,filter_json,is_default) VALUES (?,?,?,?,?,?,?)');
  $statement->execute([$id, $userId, $tripId, $name, $viewType, $filters, $isDefault]);
  json_response(['id' => $id], 201);
}

if (method() === 'PUT') {
  $data = input_json();
  $id = clean_string($data['id'] ?? null, 36);
  if (!$id) json_response(['error' => 'Missing id'], 400);
  $existing = $pdo->prepare('SELECT trip_id,view_type FROM saved_views WHERE id=? AND user_id=? LIMIT 1');
  $existing->execute([$id, $userId]);
  $row = $existing->fetch();
  if (!$row) json_response(['error' => 'Saved view not found'], 404);
  $tripId = array_key_exists('trip_id', $data) ? ((int) $data['trip_id'] ?: null) : ($row['trip_id'] !== null ? (int) $row['trip_id'] : null);
  $viewType = clean_string($data['view_type'] ?? $row['view_type'], 50) ?: 'timeline';
  $name = clean_string($data['name'] ?? null, 100) ?: 'Lagret visning';
  $filters = json_encode($data['filter_json'] ?? $data['filters'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $isDefault = !empty($data['is_default']) ? 1 : 0;
  if ($isDefault) {
    $reset = $pdo->prepare('UPDATE saved_views SET is_default=0 WHERE user_id=? AND view_type=? AND trip_id <=> ? AND id<>?');
    $reset->execute([$userId, $viewType, $tripId, $id]);
  }
  $statement = $pdo->prepare('UPDATE saved_views SET trip_id=?,name=?,view_type=?,filter_json=?,is_default=? WHERE id=? AND user_id=?');
  $statement->execute([$tripId, $name, $viewType, $filters, $isDefault, $id, $userId]);
  json_response(['ok' => true]);
}

if (method() === 'DELETE') {
  $id = clean_string($_GET['id'] ?? null, 36);
  if (!$id) json_response(['error' => 'Missing id'], 400);
  $statement = $pdo->prepare('DELETE FROM saved_views WHERE id=? AND user_id=?');
  $statement->execute([$id, $userId]);
  json_response(['ok' => true]);
}

json_response(['error' => 'Method not allowed'], 405);