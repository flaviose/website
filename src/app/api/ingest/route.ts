import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// ESP32 posts here with its owner's per-user key in X-API-Key.
// The key identifies which user the reading belongs to.
export async function POST(req: Request) {
  const key = req.headers.get("x-api-key");
  if (!key) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { rows } = await pool.query(
    "SELECT id FROM users WHERE ingest_key = $1",
    [key]
  );
  const owner = rows[0];
  if (!owner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body must be JSON" }, { status: 400 });
  }

  const { station, temp_c, humidity } = (body ?? {}) as Record<string, unknown>;
  if (
    typeof station !== "string" ||
    typeof temp_c !== "number" ||
    typeof humidity !== "number"
  ) {
    return NextResponse.json(
      { error: "expected { station: string, temp_c: number, humidity: number }" },
      { status: 400 }
    );
  }

  await pool.query(
    "INSERT INTO readings (user_id, station, temp_c, humidity) VALUES ($1, $2, $3, $4)",
    [owner.id, station, temp_c, humidity]
  );
  return NextResponse.json({ ok: true });
}
