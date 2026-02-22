require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
/* STAGE_245 migration runner
   Uses: ../src/config/db.js (exports { pool, query, getClient })
   Does NOT pool.end() — app reuses the singleton
*/

const fs = require("fs");
const path = require("path");
const { pool } = require("../src/config/db");

async function run() {
  const sqlPath = path.join(__dirname, "..", "migrations", "245_stripe.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const client = await pool.connect();
  try {
    console.log("[STAGE_245] Running migration 245_stripe.sql...");
    await client.query(sql);
    console.log("[STAGE_245] ✅ Migration complete");
  } catch (err) {
    console.error("[STAGE_245] ❌ Migration failed:", err?.message || err);
    process.exit(1);
  } finally {
    client.release();
  }
}

run();
