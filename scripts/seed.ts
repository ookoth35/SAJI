#!/usr/bin/env node
import "dotenv/config"; 
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

async function seedDatabase() {
  console.log("Starting database initialization and seeding...");

  try {
    const pool = new Pool({
      connectionString: DATABASE_URL,
    });

    const db = drizzle(pool, { schema });

    console.log("Initializing database schema...");

    // Create admin user
    const adminUser = await db
      .insert(schema.users)
      .values({
        email: "admin@saji.dev",
        firstName: "Admin",
        lastName: "User",
        password: "$2b$10$teH1T5lquPB98EFvAMOdA.FWH5B//YEg8d7sa0gv6pnkVe1oZsMQy$2b$10$gK1CPdjQhpPPBhAYjSWe0u3ROsqcGvdKKwXMkVt74snOW9O3KWgWm", 
        role: "admin",
        status: "active",
        isEmailVerified: true,
        isPhoneVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    console.log("✓ Admin user created/exists:", adminUser[0]?.id || "already exists");

    // Create sample professional
    const professionalUser = await db
      .insert(schema.users)
      .values({
        email: "professional@saji.dev",
        firstName: "Jane",
        lastName: "Professional",
        password: " $2b$10$5eKy6PJy0glRenSiBVd/Gujy0w0fiQF83/P9JstDOm1vxoHdA5w5W",
        phone: "+254700000001",
        role: "professional",
        status: "active",
      })
      .onConflictDoNothing()
      .returning();

    console.log(
      "✓ Professional user created:",
      professionalUser[0]?.id || "already exists"
    );

    // Create sample client
    const clientUser = await db
      .insert(schema.users)
      .values({
        email: "client@saji.dev",
        firstName: "John",
        lastName: "Client",
        password: "$2b$10$pe.gqrLx0dah8Atmm48IqOyOuWYQm8zfqKGo898KYPtBWvaKRXR02",
        phone: "+254700000002",
        role: "client",
        status: "active",
      })
      .onConflictDoNothing()
      .returning();

    console.log("✓ Client user created:", clientUser[0]?.id || "already exists");

    // Create sample support agent
    if (professionalUser[0]) {
      const supportAgent = await db
        .insert(schema.supportAgents)
        .values({
          userId: professionalUser[0].id,
          status: "online",
          activeChatsCount: 0,
          maxConcurrentChats: 5,
          acceptsChat: true,
          isAvailable: true,
        })
        .onConflictDoNothing()
        .returning();

      console.log("✓ Support agent created:", supportAgent[0]?.id || "already exists");
    }

    console.log("\nDatabase initialization and seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
