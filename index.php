<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
travel_os_start_session(defined('SESSION_LIFETIME') ? SESSION_LIFETIME : 0);
if (empty($_SESSION['travel_os_authenticated']) && !travel_os_restore_session_from_cookie()) { header('Location: login.php'); exit; }
?><!doctype html>
<html lang="no">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Travel OS v3</title>
        <link rel="stylesheet" href="assets/styles.css">
    </head>
    <body>
        <div id="app"></div>
        <script src="assets/app.js"></script>
    </body>
</html>
