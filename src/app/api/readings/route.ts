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
  const station = searchParams.get("station");
  const hours = Math.min(
    Math.max(Number(searchParams.get("hours") ?? 24), 1),
    24 * 90
  );

  const params: unknown[] = [String(hours), userId];
  let where = "user_id = $2 AND ts > now() - ($1 || ' hours')::interval";
  if (station) {
    params.push(station);
    where += ` AND station = $${params.length}`;
  }

  const { rows } = await pool.query(
    `SELECT ts, station, temp_c, humidity FROM readings
     WHERE ${where} ORDER BY ts ASC`,
    params
  );
  return NextResponse.json(rows);
}
