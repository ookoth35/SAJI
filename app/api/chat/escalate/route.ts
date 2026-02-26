import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatEscalations, supportAgents } from "@/lib/db/schema"
import { eq, and, lt } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, escalationReason, priority = "normal" } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      )
    }

    console.log("[v0] Escalating chat:", { conversationId, priority })

    // Find an available agent
    const availableAgent = await db.query.supportAgents.findFirst({
      where: and(
        eq(supportAgents.isAvailable, true),
        eq(supportAgents.acceptsChat, true),
        lt(supportAgents.activeChatsCount, supportAgents.maxConcurrentChats)
      ),
    })

    // Create escalation record
    const escalation = await db
      .insert(chatEscalations)
      .values({
        conversationId,
        assignedAgentId: availableAgent?.id,
        escalationReason,
        priority,
        status: availableAgent ? "assigned" : "pending",
        assignedAt: availableAgent ? new Date() : undefined,
      })
      .returning()

    console.log("[v0] Escalation created:", {
      id: escalation[0].id,
      agentId: availableAgent?.id,
      status: escalation[0].status,
    })

    // If agent assigned, update their active chat count
    if (availableAgent) {
      await db
        .update(supportAgents)
        .set({
          activeChatsCount: availableAgent.activeChatsCount + 1,
        })
        .where(eq(supportAgents.id, availableAgent.id))
    }

    return NextResponse.json({
      success: true,
      escalation: escalation[0],
      assignedAgent: availableAgent || null,
    })
  } catch (error) {
    console.error("[v0] Error escalating chat:", error)
    return NextResponse.json(
      { error: "Failed to escalate chat" },
      { status: 500 }
    )
  }
}
