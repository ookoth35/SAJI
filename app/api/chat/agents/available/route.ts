import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supportAgents } from "@/lib/db/schema"
import { eq, and, lt } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    console.log("[v0] Fetching available agents")

    // Find all available agents
    const availableAgents = await db
      .select()
      .from(supportAgents)
      .where(
        and(
          eq(supportAgents.isAvailable, true),
          eq(supportAgents.acceptsChat, true),
          lt(supportAgents.activeChatsCount, supportAgents.maxConcurrentChats)
        )
      )

    console.log("[v0] Found available agents:", availableAgents.length)

    return NextResponse.json({
      success: true,
      agents: availableAgents,
      availableCount: availableAgents.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching available agents:", error)
    return NextResponse.json(
      { error: "Failed to fetch available agents" },
      { status: 500 }
    )
  }
}
