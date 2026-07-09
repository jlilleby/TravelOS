<?php
declare(strict_types=1);
session_start(['cookie_httponly'=>true,'cookie_secure'=>false,'cookie_samesite'=>'Lax']);
if (empty($_SESSION['travel_os_authenticated'])) { header('Location: login.php'); exit; }
?><!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Travel OS v3</title><link rel="stylesheet" href="assets/styles.css"></head><body><div id="app"></div><script src="assets/app.js"></script></body></html>
