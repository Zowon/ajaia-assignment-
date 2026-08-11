import { Pool } from "pg";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

// Load .env if present
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  console.log("Running migration and seeding data...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled document',
      content TEXT NOT NULL DEFAULT '',
      owner_id TEXT NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      permission TEXT NOT NULL DEFAULT 'edit',
      created_at TEXT NOT NULL,
      UNIQUE(document_id, user_id)
    );
  `);

  console.log("Schema created.");

  const seedUsers = [
    { id: "u_amina", name: "Amina Rahman", email: "amina@ajaia.test" },
    { id: "u_bilal", name: "Bilal Khan", email: "bilal@ajaia.test" },
    { id: "u_chen", name: "Chen Wei", email: "chen@ajaia.test" },
  ];

  for (const u of seedUsers) {
    await pool.query(
      "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
      [u.id, u.name, u.email]
    );
  }

  const res = await pool.query("SELECT COUNT(*) as c FROM documents");
  if (parseInt(res.rows[0].c, 10) === 0) {
    const now = new Date().toISOString();
    await pool.query(
      `INSERT INTO documents (id, title, content, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        "d_welcome",
        "Welcome to DocEdit",
        "<h1>Welcome to DocEdit</h1><p>This is a seeded example document owned by <strong>Amina Rahman</strong>. Log in as Bilal or Chen to see how shared documents show up separately from owned ones.</p><ul><li>Try editing this text</li><li>Try sharing it with another user</li></ul>",
        "u_amina",
        now,
        now,
      ]
    );
  }

  console.log("Seeding complete.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
