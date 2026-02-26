#!/usr/bin/env node

import { Pool } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

async function runMigrations() {
  console.log("Starting database migrations...");

  try {
    const pool = new Pool({
      connectionString: DATABASE_URL,
    });

    const db = drizzle(pool);

    console.log("Running migrations...");
    await migrate(db, {
      migrationsFolder: "./lib/db/migrations",
    });

    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
