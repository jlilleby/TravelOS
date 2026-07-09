# Travel OS

Travel OS is a personal travel planning web app for organizing trips, events, documents, packing lists, and budgets in one place. It is built with PHP, MySQL, and a lightweight vanilla JavaScript frontend.

## What it does

Travel OS helps you manage a trip from planning to execution. You can:

- create and switch between trips
- plan timeline events such as flights, drives, accommodation, photos, hikes, reminders, and more
- attach documents to a trip or a specific event
- maintain a packing checklist
- track trip expenses and budget items
- import trip data from JSON
- protect the app with a password-based login

## Tech stack

- PHP for the server-side application and API endpoints
- MySQL/MariaDB for data storage
- HTML, CSS, and vanilla JavaScript for the frontend
- File uploads stored in the uploads directory

## Project structure

- index.php: main app entry point after authentication
- login.php: login page
- api/: PHP API endpoints for trips, events, documents, packing, budget, and import
- assets/: frontend JavaScript and stylesheets
- uploads/: uploaded files are stored here
- database.sql: database schema and initial demo data
- config.php: runtime configuration for database and app settings

## Requirements

- PHP 8+
- MySQL or MariaDB
- A web server such as Apache or Nginx
- Write access to the uploads directory

## Setup

1. Create a config.php file in the project root.
2. Define the required constants for the database connection, password hash, upload limits, and allowed file extensions.
3. Create the database and import database.sql.
4. Make sure the uploads directory is writable by the web server.
5. Start the app in your local web server and visit the site in your browser.

Example configuration:

```php
<?php

define('DB_HOST', 'localhost');
define('DB_NAME', 'travel_os');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

define('APP_PASSWORD_HASH', password_hash('your-password', PASSWORD_BCRYPT));
define('MAX_UPLOAD_BYTES', 15 * 1024 * 1024);
define('ALLOWED_EXTENSIONS', ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'txt', 'docx', 'xlsx', 'csv']);
```

## Notes

- The app expects a configured config.php file before it will run.
- Uploaded files are stored on disk and referenced from the database.
- The project is currently a lightweight single-user travel planner and is not a full multi-user SaaS application.

## License

This project is provided as-is for personal and educational use.
