import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

let ensured = false;
async function ensure() {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS positions (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device TEXT NOT NULL,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      speed_kmh DOUBLE PRECISION,
      accuracy_m DOUBLE PRECISION
    );
    CREATE INDEX IF NOT EXISTS positions_user_device_ts
      ON positions (user_id, device, ts DESC);
  `);
  ensured = true;
}

export async function POST(req: Request) {
  const key = req.headers.get("x-api-key");
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    `SELECT id FROM users WHERE ingest_key = $1`,
    [key]
  );
  const user = rows[0];
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const b = await req.json().catch(() => null);
  if (!b || typeof b.lat !== "number" || typeof b.lng !== "number" || !b.device) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  await ensure();
  await pool.query(
    `INSERT INTO positions (user_id, device, lat, lng, speed_kmh, accuracy_m)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.id, b.device, b.lat, b.lng, b.speed_kmh ?? null, b.accuracy_m ?? null]
  );
  return NextResponse.json({ ok: true });
}