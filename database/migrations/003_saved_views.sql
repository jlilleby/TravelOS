CREATE TABLE saved_views (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  trip_id INT NULL,
  name VARCHAR(100) NOT NULL,
  view_type VARCHAR(50) NOT NULL DEFAULT 'timeline',
  filter_json JSON NOT NULL,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_views_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_saved_views_scope (user_id, trip_id, view_type),
  INDEX idx_saved_views_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;