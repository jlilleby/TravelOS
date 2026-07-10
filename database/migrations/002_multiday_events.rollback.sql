-- Rollback for 002_multiday_events.sql
-- Note: this only removes the column if it exists.
ALTER TABLE events DROP COLUMN IF EXISTS display_mode;
