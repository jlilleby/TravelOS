-- Rollback for cleanup release event model migration.
-- Note: event_type rollback is best-effort and uses subtype hints where available.

-- Re-expand display modes.
UPDATE events
SET display_mode = CASE
  WHEN LOWER(display_mode) = 'status' THEN 'daily'
  ELSE 'single'
END;

-- Recover a subset of former event types from subtype where available.
UPDATE events
SET event_type = CASE LOWER(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')))
  WHEN 'camp' THEN 'camp'
  WHEN 'camping' THEN 'camping'
  WHEN 'hotel' THEN 'hotel'
  WHEN 'workshop' THEN 'workshop'
  WHEN 'special-event' THEN 'special-event'
  WHEN 'special_event' THEN 'special-event'
  WHEN 'eclipse' THEN 'eclipse'
  WHEN 'cruise' THEN 'cruise'
  WHEN 'car' THEN 'car'
  WHEN 'car-rental' THEN 'car-rental'
  WHEN 'car_rental' THEN 'car-rental'
  ELSE event_type
END
WHERE event_type IN ('accommodation', 'special', 'car_rental');
