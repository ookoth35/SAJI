import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatbotConversations, chatbotMessages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, message, userId } = body

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("[v0] Saving user message:", { conversationId, userId })

    // Save user message
    const userMessage = await db
      .insert(chatbotMessages)
      .values({
        conversationId,
        sender: "user",
        message,
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: userMessage[0],
    })
  } catch (error) {
    console.error("[v0] Error saving message:", error)
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    )
  }
}
