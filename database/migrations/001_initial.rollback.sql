-- Rollback for 001_initial.sql
-- Warning: this removes tables and all data in them.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS budget_items;
DROP TABLE IF EXISTS packing_items;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS trips;
SET FOREIGN_KEY_CHECKS = 1;
