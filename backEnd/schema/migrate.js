import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./db.config.js";

const schemaDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(schemaDirectory, "migrations");

async function runMigrations() {
  const connection = await db.getConnection();

  try {
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const version of migrationFiles) {
      const sql = await readFile(
        path.join(migrationsDirectory, version),
        "utf8",
      );
      const statements = sql
        .split(";")
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await connection.query(statement);
      }
      console.log(`Applied (or already present): ${version}`);
    }
  } finally {
    connection.release();
    await db.end();
  }
}

runMigrations().catch((error) => {
  console.error("Database migration failed:", error);
  process.exitCode = 1;
});
