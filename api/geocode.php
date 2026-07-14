<?php
require_once __DIR__ . '/bootstrap.php';
require_auth();

header('Content-Type: application/json; charset=utf-8');

$query = trim((string)($_GET['q'] ?? ''));
if ($query === '') {
  json_response(['error' => 'Missing q'], 400);
}

$cacheDir = __DIR__ . '/../uploads/geocode-cache';
if (!is_dir($cacheDir)) {
  @mkdir($cacheDir, 0775, true);
}

$cacheKey = hash('sha256', mb_strtolower($query));
$cacheFile = $cacheDir . DIRECTORY_SEPARATOR . $cacheKey . '.json';
$maxAge = 30 * 24 * 60 * 60;

if (is_file($cacheFile) && (time() - filemtime($cacheFile)) < $maxAge) {
  $cached = json_decode((string)file_get_contents($cacheFile), true);
  if (is_array($cached) && isset($cached['coords'])) {
    json_response(['ok' => true, 'source' => 'cache', 'coords' => $cached['coords']]);
  }
}

$url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' . rawurlencode($query);
$context = stream_context_create([
  'http' => [
    'method' => 'GET',
    'timeout' => 10,
    'header' => implode("\r\n", [
      'Accept: application/json',
      'User-Agent: TravelOS/3.0',
      'Referer: https://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/',
    ]) . "\r\n",
  ],
]);

$response = @file_get_contents($url, false, $context);
if ($response === false) {
  json_response(['error' => 'Geocoding failed'], 502);
}

$payload = json_decode($response, true);
$first = is_array($payload) ? ($payload[0] ?? null) : null;
if (!$first || !isset($first['lat'], $first['lon'])) {
  json_response(['ok' => true, 'coords' => null, 'source' => 'empty']);
}

$coords = ['lat' => (float)$first['lat'], 'lng' => (float)$first['lon']];
@file_put_contents($cacheFile, json_encode(['coords' => $coords], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
json_response(['ok' => true, 'source' => 'nominatim', 'coords' => $coords]);