import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatbotMessages, chatbotConversations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID required" },
        { status: 400 }
      )
    }

    console.log("[v0] Fetching chat history for conversation:", conversationId)

    // Get conversation
    const conversation = await db.query.chatbotConversations.findFirst({
      where: eq(chatbotConversations.id, conversationId),
    })

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Get messages
    const messages = await db
      .select()
      .from(chatbotMessages)
      .where(eq(chatbotMessages.conversationId, conversationId))

    return NextResponse.json({
      success: true,
      conversation,
      messages,
    })
  } catch (error) {
    console.error("[v0] Error fetching chat history:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    )
  }
}
