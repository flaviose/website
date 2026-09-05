CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  password_hash     TEXT NOT NULL,
  verified          BOOLEAN NOT NULL DEFAULT false,
  ingest_key        TEXT UNIQUE,               -- null until verified
  verify_code_hash  TEXT,                      -- bcrypt of the emailed code
  verify_expires_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS readings (
  id        BIGSERIAL PRIMARY KEY,
  ts        TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station   TEXT NOT NULL,
  temp_c    REAL NOT NULL,
  humidity  REAL NOT NULL
);

-- Every dashboard query is now "this user's readings, one station, by time".
CREATE INDEX IF NOT EXISTS readings_user_station_ts_idx
  ON readings (user_id, station, ts DESC);
