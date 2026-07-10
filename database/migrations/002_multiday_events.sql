-- Add support for display modes on events.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS display_mode VARCHAR(20) NOT NULL DEFAULT 'single';
