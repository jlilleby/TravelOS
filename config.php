<?php
// Kopier til config.php og fyll inn verdier.
define('DB_HOST', 'lillebycloud01.mysql.domeneshop.no');
define('DB_NAME', 'lillebycloud01');
define('DB_USER', 'lillebycloud01');
define('DB_PASS', 'gafla-Fonn-Gards-39-nag');
define('DB_CHARSET', 'utf8mb4');

// Lag med: php -r "echo password_hash('PqwZGrjsPw!EBqLVQ2NsYLUGDBvwvmpVPoQiKmTJNv9ztGA2Z_m2MY', PASSWORD_DEFAULT), PHP_EOL;"
define('APP_PASSWORD_HASH', '$2a$12$Bn02lOM75FdS4LseWDd4IuKHndNw/oWxHq/ireCDJkX4cdfWNxy96');

define('COOKIE_SECURE', true); // true når HTTPS er aktivt
define('MAX_UPLOAD_BYTES', 15 * 1024 * 1024);
define('ALLOWED_EXTENSIONS', ['pdf','jpg','jpeg','png','webp','txt','docx','xlsx','csv']);
