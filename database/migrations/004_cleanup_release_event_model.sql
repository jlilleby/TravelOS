-- Cleanup release: normalize event types + display modes without deleting data.
-- This migration preserves all rows and stores old variants as subtype for accommodation/special.

UPDATE events
SET event_type = LOWER(REPLACE(event_type, '-', '_'));

-- Move known legacy types into standardized model.
UPDATE events
SET event_type = 'car_rental'
WHERE event_type IN ('car', 'car_rental');

UPDATE events
SET
  event_type = 'accommodation',
  data_json = JSON_SET(COALESCE(data_json, JSON_OBJECT()), '$.subtype',
    COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')), ''), event_type)
  )
WHERE event_type IN ('camp', 'camping', 'hotel');

UPDATE events
SET
  event_type = 'special',
  data_json = JSON_SET(COALESCE(data_json, JSON_OBJECT()), '$.subtype',
    COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')), ''), event_type)
  )
WHERE event_type IN ('workshop', 'special_event', 'eclipse', 'cruise');

-- Unknown legacy values become special with subtype carrying original type.
UPDATE events
SET
  data_json = JSON_SET(COALESCE(data_json, JSON_OBJECT()), '$.subtype',
    COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')), ''), event_type)
  ),
  event_type = 'special'
WHERE event_type NOT IN (
  'flight','drive','accommodation','car_rental','ferry','poi','photo','food','fuel','shopping','hike','reminder','special'
);

-- Ensure subtype exists for accommodation and special.
UPDATE events
SET data_json = JSON_SET(COALESCE(data_json, JSON_OBJECT()), '$.subtype',
  COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')), ''), 'general')
)
WHERE event_type = 'accommodation';

UPDATE events
SET data_json = JSON_SET(COALESCE(data_json, JSON_OBJECT()), '$.subtype',
  COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(COALESCE(data_json, JSON_OBJECT()), '$.subtype')), ''), 'other')
)
WHERE event_type = 'special';

-- Simplify display modes.
UPDATE events
SET display_mode = CASE
  WHEN LOWER(display_mode) IN ('status', 'daily') THEN 'status'
  WHEN LOWER(display_mode) IN ('timeline', 'single', 'range') THEN 'timeline'
  ELSE CASE WHEN event_type = 'accommodation' THEN 'status' ELSE 'timeline' END
END;
