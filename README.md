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

## Cleanup release (Timeline + Routes simplification)

This release keeps the existing PHP/MySQL architecture, but removes complexity from the Timeline and Routes flows:

- Timeline now focuses on what happens, when, and basic details.
- New event creation is moved to a modal.
- Advanced filters are reduced to search, event type, from date, and to date.
- Quick filters are: Alle, Transport, Overnatting, POI, Foto.
- Focus Modes are removed from the PHP version.
- Event types are standardized to:
	- `flight`
	- `drive`
	- `accommodation`
	- `car_rental`
	- `ferry`
	- `poi`
	- `photo`
	- `food`
	- `fuel`
	- `shopping`
	- `hike`
	- `reminder`
	- `special`
- `accommodation` and `special` store subtype in `data_json.subtype`.
- `display_mode` is simplified to `timeline` or `status`.
- Multi-day events are still stored as one event row.
- Routes only uses physical driving events (`drive`) and Google Maps route construction is based on:
	- `data.startLocation`
	- `data.viaLocations`
	- `data.endLocation`
- `viaLocations` supports semicolon and newline splitting and strips `via:` prefixes.
- Route views are: `I dag`, `Per dag`, `Hele roadtripen`.
- Full roadtrip routes are segmented for Google Maps when there are too many stops.
- Export actions are moved into a dedicated Export section.

Legacy JSON imports remain supported via backend normalization of old event types and old `display_mode` values.

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
- database.sql: legacy combined schema file
- database/migrations/: numbered SQL migrations and rollbacks
- database/README.md: database migration and schema documentation
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
- To run the cleanup migration:

```bash
mysql -u root -p travel_os < database/migrations/004_cleanup_release_event_model.sql
```

- Rollback script:

```bash
mysql -u root -p travel_os < database/migrations/004_cleanup_release_event_model.rollback.sql
```

## License

This project is provided as-is for personal and educational use.
