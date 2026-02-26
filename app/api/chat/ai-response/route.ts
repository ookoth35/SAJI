import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatbotMessages, chatbotConversations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"

// Initialize Groq
let groq: any = null

if (process.env.GROQ_API_KEY) {
  groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  })
  console.log("[v0] Groq AI initialized")
} else {
  console.warn("[v0] GROQ_API_KEY not configured")
}

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

    if (!groq) {
      return NextResponse.json(
        { error: "AI service not configured. Please set GROQ_API_KEY environment variable." },
        { status: 503 }
      )
    }

    console.log("[v0] Generating AI response for conversation:", conversationId)

    // Get conversation history
    const messages = await db
      .select()
      .from(chatbotMessages)
      .where(eq(chatbotMessages.conversationId, conversationId))

    // Format conversation history for the model
    const conversationHistory = messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.message,
    }))

    // Add current message
    conversationHistory.push({
      role: "user",
      content: message,
    })

    console.log("[v0] Conversation history length:", conversationHistory.length)

    // Generate response using Groq
    const { text: aiMessage } = await generateText({
      model: groq("mixtral-8x7b-32768"),
      system: `You are SAJI Support Assistant, a helpful customer support bot for SAJI platform. 
      You help users with questions about services, booking, payments, and account management.
      Be friendly, professional, and concise.
      If you cannot help with something technical or if the user needs human assistance, politely suggest escalating to a support agent.
      Keep responses brief (2-3 sentences max unless asked for more detail).`,
      messages: conversationHistory,
      temperature: 0.7,
      maxTokens: 500,
    })

    console.log("[v0] AI response generated successfully")

    // Save AI response to database
    const savedMessage = await db
      .insert(chatbotMessages)
      .values({
        conversationId,
        sender: "bot",
        message: aiMessage,
      })
      .returning()

    return NextResponse.json({
      success: true,
      response: aiMessage,
      message: savedMessage[0],
    })
  } catch (error) {
    console.error("[v0] Error generating AI response:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate response"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
