import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { agentChatHistory } from "@/lib/db/schema"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { escalationId, message, agentId, userId } = body

    if (!escalationId || !message || !agentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("[v0] Saving agent reply:", { escalationId, agentId })

    // Save agent message
    const agentMessage = await db
      .insert(agentChatHistory)
      .values({
        escalationId,
        agentId,
        userId: userId || "unknown",
        sender: "agent",
        message,
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: agentMessage[0],
    })
  } catch (error) {
    console.error("[v0] Error saving agent reply:", error)
    return NextResponse.json(
      { error: "Failed to save reply" },
      { status: 500 }
    )
  }
}
