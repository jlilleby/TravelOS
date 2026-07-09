<?php
declare(strict_types=1);
session_start(['cookie_httponly'=>true,'cookie_secure'=>false,'cookie_samesite'=>'Lax']);
$error = null;
$configPath = __DIR__ . '/config.php';
if (!file_exists($configPath)) $error = 'Mangler config.php. Kopier config.example.php til config.php først.';
else require_once $configPath;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$error) {
  $password = $_POST['password'] ?? '';
  if (password_verify($password, APP_PASSWORD_HASH)) {
    session_regenerate_id(true);
    $_SESSION['travel_os_authenticated'] = true;
    header('Location: index.php'); exit;
  }
  $error = 'Feil passord.';
}
?><!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Travel OS Login</title><link rel="stylesheet" href="assets/styles.css"></head><body class="login-page"><main class="login-card"><div class="logo-mark">🧭</div><h1>Travel OS</h1><p>Skriv inn app-passord for å åpne turplanleggeren.</p><?php if ($error): ?><div class="alert"><?= htmlspecialchars($error) ?></div><?php endif; ?><form method="post"><label>Passord</label><input type="password" name="password" autofocus required><button type="submit">Åpne app</button></form></main></body></html>
