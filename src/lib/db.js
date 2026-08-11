import { Pool } from "pg";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Reuse a single connection pool across hot reloads in dev.
const globalForDb = globalThis;
export const db = globalForDb.__docedit_db || pool;
if (process.env.NODE_ENV !== "production") globalForDb.__docedit_db = db;

export function newId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

export async function getUserByEmail(email) {
  const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}

export async function getUserById(id) {
  const res = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
}

export async function listUsers() {
  const res = await db.query("SELECT * FROM users ORDER BY name");
  return res.rows;
}
