import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = Number(session.id);

  const { searchParams } = new URL(req.url);
  const device = searchParams.get("device") ?? "bike-1";

  const { rows } = await pool.query(
    `SELECT ts, lat, lng, speed_kmh FROM positions
     WHERE user_id = $1 AND device = $2
     ORDER BY ts ASC LIMIT 500`,
    [userId, device]
  );
  return NextResponse.json(rows);
}