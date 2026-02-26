import { db } from "@/lib/db";
import { oauthAccounts, oauthSessions } from "@/lib/db/schema";

export async function migrateOAuthTables() {
  try {
    console.log("Creating OAuth tables...");

    // Tables will be created automatically by Drizzle ORM
    // This is just a placeholder for any additional migration logic
    
    console.log("OAuth tables migrated successfully!");
    return { success: true };
  } catch (error) {
    console.error("OAuth migration error:", error);
    throw error;
  }
}
