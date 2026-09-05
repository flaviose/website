import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = Number(session.id);

  const { rows } = await pool.query(
    `SELECT DISTINCT ON (station) station, ts, temp_c, humidity
     FROM readings WHERE user_id = $1 ORDER BY station, ts DESC`,
    [userId]
  );
  return NextResponse.json(rows);
}
