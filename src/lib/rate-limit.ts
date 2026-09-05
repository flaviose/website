import { pool } from "@/lib/db";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000; // 15 minutes

// Create the table once, lazily, so no manual migration is needed.
let ensured: Promise<unknown> | null = null;
function ensureTable() {
  if (!ensured) {
    ensured = pool.query(`
      CREATE TABLE IF NOT EXISTS login_throttle (
        identifier   TEXT PRIMARY KEY,
        fail_count   INT NOT NULL DEFAULT 0,
        locked_until TIMESTAMPTZ
      )
    `);
  }
  return ensured;
}

// Seconds remaining if locked, else null.
export async function secondsUntilUnlock(id: string): Promise<number | null> {
  await ensureTable();
  const { rows } = await pool.query(
    "SELECT locked_until FROM login_throttle WHERE identifier = $1",
    [id]
  );
  const lu: Date | null = rows[0]?.locked_until ?? null;
  if (lu && lu.getTime() > Date.now()) {
    return Math.ceil((lu.getTime() - Date.now()) / 1000);
  }
  return null;
}

export async function recordFailure(id: string): Promise<void> {
  await ensureTable();
  const { rows } = await pool.query(
    "SELECT fail_count, locked_until FROM login_throttle WHERE identifier = $1",
    [id]
  );
  const row = rows[0];

  // No record, or a lock that has already expired → start a fresh count.
  if (!row || (row.locked_until && row.locked_until.getTime() <= Date.now())) {
    await pool.query(
      `INSERT INTO login_throttle (identifier, fail_count, locked_until)
       VALUES ($1, 1, NULL)
       ON CONFLICT (identifier)
       DO UPDATE SET fail_count = 1, locked_until = NULL`,
      [id]
    );
    return;
  }

  const next = row.fail_count + 1;
  const lockedUntil = next >= MAX_FAILS ? new Date(Date.now() + LOCK_MS) : null;
  await pool.query(
    "UPDATE login_throttle SET fail_count = $2, locked_until = $3 WHERE identifier = $1",
    [id, next, lockedUntil]
  );
}

export async function clearFailures(id: string): Promise<void> {
  await ensureTable();
  await pool.query("DELETE FROM login_throttle WHERE identifier = $1", [id]);
}
