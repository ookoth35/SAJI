import dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/neon-http";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) throw new Error("DATABASE_URL not set in .env");

const db = drizzle(DATABASE_URL);

async function test() {
  const result = await db.execute(`SELECT NOW()`);
  console.log("DB Connected! Timestamp:", result);
}

test().catch(console.error);