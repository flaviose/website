// Seeds one login account and a few days of demo readings for two stations.
// Run once after the DB is up:  npm run seed
// Configure the account via env: SEED_EMAIL, SEED_PASSWORD, SEED_NAME.
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const email = (process.env.SEED_EMAIL || "flavio@weatherbound.com").toLowerCase();
const password = process.env.SEED_PASSWORD || "changeme";
const name = process.env.SEED_NAME || "Flavio";

async function main() {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
    [email, name, hash]
  );
  console.log(`user ready: ${email}  (password: ${password})`);

  // Only seed demo data if the table is empty, so re-running is safe.
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM readings");
  if (rows[0].n > 0) {
    console.log(`readings already present (${rows[0].n}); skipping demo data.`);
    await pool.end();
    return;
  }

  const stations = ["field-01", "field-02"];
  const now = Date.now();
  const values = [];
  const params = [];
  let i = 1;
  // 3 days, one reading every 10 minutes, per station.
  for (const station of stations) {
    for (let m = 3 * 24 * 6; m >= 0; m--) {
      const t = new Date(now - m * 10 * 60 * 1000);
      const hour = t.getHours() + t.getMinutes() / 60;
      const diurnal = Math.sin(((hour - 9) / 24) * 2 * Math.PI); // peak ~15:00
      const base = station === "field-01" ? 14 : 11;
      const temp = base + 7 * diurnal + (Math.random() - 0.5) * 1.2;
      const hum = 70 - 18 * diurnal + (Math.random() - 0.5) * 4;
      params.push(t.toISOString(), station, +temp.toFixed(2), +Math.max(0, Math.min(100, hum)).toFixed(1));
      values.push(`($${i++}, $${i++}, $${i++}, $${i++})`);
    }
  }
  await pool.query(
    `INSERT INTO readings (ts, station, temp_c, humidity) VALUES ${values.join(",")}`,
    params
  );
  console.log(`inserted ${values.length} demo readings across ${stations.length} stations.`);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
