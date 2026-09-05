// db/add-user.mjs
// Adds (or updates) a single login account.
//   docker compose --profile adduser run --rm \
//     -e NEW_EMAIL=inga@weatherbound.com -e NEW_PASSWORD='...' -e NEW_NAME='Inga' adduser
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const email = (process.env.NEW_EMAIL || "").toLowerCase().trim();
const password = process.env.NEW_PASSWORD || "";
const name = process.env.NEW_NAME || email.split("@")[0];

if (!email || !password) {
  console.error("Set NEW_EMAIL and NEW_PASSWORD.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
await pool.query(
  `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
  [email, name, hash]
);
console.log(`user ready: ${email}`);
await pool.end();
