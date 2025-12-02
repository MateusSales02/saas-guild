-- Script to clear database and force reseed with all 309 items
-- Execute this in pgAdmin Query Tool or using psql

DELETE FROM build_items_map;
DELETE FROM builds;
DELETE FROM build_specs;
DELETE FROM build_classes;
DELETE FROM build_items;

-- After running this, restart your API server
-- The seedDefaults() function will run automatically and load all 309 items
