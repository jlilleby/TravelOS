<?php
require_once __DIR__ . '/bootstrap.php';
require_auth();

if (method() !== 'POST') {
  json_response(['error' => 'Method not allowed'], 405);
}

$pdo = db();
$data = input_json();
$trip = $data['trip'] ?? [];
$events = $data['events'] ?? [];
$packing = $data['packing'] ?? [];
$budget = $data['budget'] ?? [];

$pdo->beginTransaction();

try {
  $tripStatement = $pdo->prepare('INSERT INTO trips (name,destination,start_date,end_date,notes) VALUES (?,?,?,?,?)');
  $tripStatement->execute([
    clean_string($trip['name'] ?? null, 255) ?: 'Importert tur',
    clean_string($trip['destination'] ?? null, 255),
    clean_string($trip['start'] ?? $trip['start_date'] ?? null, 20),
    clean_string($trip['end'] ?? $trip['end_date'] ?? null, 20),
    clean_string($trip['notes'] ?? null, 5000),
  ]);
  $tripId = (int) $pdo->lastInsertId();

  $eventStatement = $pdo->prepare('INSERT INTO events (trip_id,event_type,title,start_date,start_time,end_date,end_time,notes,data_json,display_mode) VALUES (?,?,?,?,?,?,?,?,?,?)');
  foreach ($events as $event) {
    $normalized = normalize_event_type_and_data(clean_string($event['type'] ?? $event['event_type'] ?? null, 50) ?: 'poi', $event['data'] ?? []);
    $displayMode = normalize_display_mode_value(clean_string($event['display_mode'] ?? $event['displayMode'] ?? null, 20), $normalized['event_type']);

    $eventStatement->execute([
      $tripId,
      $normalized['event_type'],
      clean_string($event['title'] ?? null, 255) ?: 'Event',
      clean_string($event['date'] ?? $event['start_date'] ?? null, 20) ?: date('Y-m-d'),
      clean_string($event['time'] ?? $event['start_time'] ?? null, 20),
      clean_string($event['end_date'] ?? null, 20),
      clean_string($event['end_time'] ?? null, 20),
      clean_string($event['notes'] ?? null, 5000),
      json_encode($normalized['data'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      $displayMode,
    ]);
  }

  $packingStatement = $pdo->prepare('INSERT INTO packing_items (trip_id,item_text,place,packed,category) VALUES (?,?,?,?,?)');
  foreach ($packing as $item) {
    $packingStatement->execute([
      $tripId,
      clean_string($item['text'] ?? $item['item_text'] ?? null, 255) ?: 'Item',
      clean_string($item['place'] ?? null, 255),
      !empty($item['packed']) ? 1 : 0,
      clean_string($item['category'] ?? null, 100),
    ]);
  }

  $budgetStatement = $pdo->prepare('INSERT INTO budget_items (trip_id,category,item_name,amount,currency,paid) VALUES (?,?,?,?,?,?)');
  foreach ($budget as $entry) {
    $budgetStatement->execute([
      $tripId,
      clean_string($entry['category'] ?? null, 100),
      clean_string($entry['name'] ?? $entry['item_name'] ?? null, 255) ?: 'Item',
      (float) ($entry['amount'] ?? 0),
      clean_string($entry['currency'] ?? 'NOK', 10) ?: 'NOK',
      !empty($entry['paid']) ? 1 : 0,
    ]);
  }

  $pdo->commit();
  json_response(['trip_id' => $tripId], 201);
} catch (Throwable $e) {
  $pdo->rollBack();
  json_response(['error' => 'Import failed', 'detail' => $e->getMessage()], 500);
}
