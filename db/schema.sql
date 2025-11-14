-- Cloudflare D1 schema for Tower Delight driver workflow dashboard
DROP TABLE IF EXISTS driver_dashboard;

CREATE TABLE driver_dashboard (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);


