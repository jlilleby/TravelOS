# Database

## Migration policy

Travel OS uses versioned SQL migrations in the migrations folder. Every schema change should be added as a new numbered migration and applied in order.

Rules:
- do not overwrite existing data
- keep migrations idempotent where practical
- include a rollback script when it is practical
- update documentation when schema changes are introduced

## Current data model

- trips: top-level travel plans
- events: timeline entries tied to a trip, including a display_mode field for timeline/status behavior
- documents: files attached to a trip or an event
- packing_items: checklist entries for a trip
- budget_items: budget entries for a trip

## Multi-day event support

Events that span multiple days are stored as a single row in events with start_date, start_time, end_date, and end_time. The app uses the display_mode field to decide how they appear in the timeline:

- timeline: show start and end entries for the period
- status: show start and end entries, and compact mid-day status entries in day headers

## Cleanup release migration

`004_cleanup_release_event_model.sql` standardizes event types and display modes while preserving all existing rows and JSON payloads.

- standardized event types: flight, drive, accommodation, car_rental, ferry, poi, photo, food, fuel, shopping, hike, reminder, special
- legacy types are mapped forward
- subtype is stored in `data_json.subtype` for `accommodation` and `special`
- display_mode is normalized to `timeline` or `status`

## Applying migrations

Example:

```bash
mysql -u root -p travel_os < database/migrations/001_initial.sql
```

## Rollback

Example:

```bash
mysql -u root -p travel_os < database/migrations/001_initial.rollback.sql
```
