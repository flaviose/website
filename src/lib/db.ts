import { Pool } from "pg";

// Reuse one pool across hot reloads in dev; create once in prod.
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") global._pgPool = pool;
