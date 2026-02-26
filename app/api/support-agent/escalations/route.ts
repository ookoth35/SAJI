import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supportAgents, chatEscalations, users, agentChatHistory } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    let decoded: any

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Find user and agent
    const user = await db.query.users.findFirst({
      where: eq(users.email, decoded.email),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const agent = await db.query.supportAgents.findFirst({
      where: eq(supportAgents.userId, user.id),
    })

    if (!agent) {
      return NextResponse.json({ error: "Not a support agent" }, { status: 403 })
    }

    // Get assigned escalations
    const escalations = await db
      .select()
      .from(chatEscalations)
      .where(eq(chatEscalations.assignedAgentId, agent.id))

    // Get messages for each escalation
    const escalationsWithMessages = await Promise.all(
      escalations.map(async (escalation) => {
        const messages = await db
          .select()
          .from(agentChatHistory)
          .where(eq(agentChatHistory.escalationId, escalation.id))

        return {
          ...escalation,
          messages: messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            message: m.message,
            sentAt: m.sentAt,
          })),
        }
      })
    )

    // Calculate stats
    const stats = {
      activeChats: escalations.filter((e) => e.status === "in_progress").length,
      pendingEscalations: escalations.filter((e) => e.status === "pending").length,
      resolvedToday: escalations.filter((e) => e.status === "resolved").length,
    }

    console.log("[v0] Loaded escalations for agent:", agent.id, "Count:", escalations.length)

    return NextResponse.json({
      escalations: escalationsWithMessages,
      stats,
      agent: {
        id: agent.id,
        status: agent.status,
        activeChatsCount: agent.activeChatsCount,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching escalations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
