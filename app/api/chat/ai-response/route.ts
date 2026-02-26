import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatbotMessages, chatbotConversations, faqArticles, knowledgeDocuments } from "@/lib/db/schema"
import { eq, and, sql, ilike } from "drizzle-orm"
import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import crypto from "crypto"

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

// Function to search FAQs and documents based on user message
async function getRelevantKnowledge(message: string) {
  try {
    const keywords = message.split(" ").filter((w) => w.length > 3)

    // Search FAQs
    const relatedFaqs = await db
      .select()
      .from(faqArticles)
      .where(
        and(
          eq(faqArticles.isActive, true),
          sql`(
            ${faqArticles.question} ILIKE ${"%" + message + "%"} OR
            ${faqArticles.answer} ILIKE ${"%" + message + "%"} OR
            ${faqArticles.keywords} ILIKE ${"%" + keywords.join("%") + "%"}
          )`
        )
      )
      .limit(3)

    // Search knowledge documents
    const relatedDocs = await db
      .select()
      .from(knowledgeDocuments)
      .where(
        and(
          eq(knowledgeDocuments.isActive, true),
          sql`(
            ${knowledgeDocuments.title} ILIKE ${"%" + message + "%"} OR
            ${knowledgeDocuments.content} ILIKE ${"%" + message + "%"}
          )`
        )
      )
      .limit(3)

    return {
      faqs: relatedFaqs,
      documents: relatedDocs,
    }
  } catch (error) {
    console.error("[v0] Error fetching knowledge sources:", error)
    return { faqs: [], documents: [] }
  }
}

// Function to build context from knowledge sources
function buildKnowledgeContext(knowledge: any): string {
  let context = ""

  if (knowledge.faqs.length > 0) {
    context += "## Relevant FAQs:\n"
    knowledge.faqs.forEach((faq: any) => {
      context += `\nQ: ${faq.question}\nA: ${faq.answer}\n`
    })
  }

  if (knowledge.documents.length > 0) {
    context += "\n## Relevant Information:\n"
    knowledge.documents.forEach((doc: any) => {
      context += `\n[${doc.title}]\n${doc.content.substring(0, 300)}...\n`
    })
  }

  return context
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

    console.log("[v0] Processing AI response for:", conversationId)

    // Get relevant knowledge from FAQ and documents
    const knowledge = await getRelevantKnowledge(message)
    const knowledgeContext = buildKnowledgeContext(knowledge)

    console.log("[v0] Found relevant FAQs:", knowledge.faqs.length, "Docs:", knowledge.documents.length)

    // Get conversation history
    const messages = await db
      .select()
      .from(chatbotMessages)
      .where(eq(chatbotMessages.conversationId, conversationId))
      .orderBy(chatbotMessages.sentAt)

    // Format conversation history
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

    // Build system prompt with knowledge
    const systemPrompt = `You are SAJI Support Assistant, a helpful customer support bot for SAJI platform.

IMPORTANT GUIDELINES:
- Use the provided FAQ and Knowledge Base information to answer questions accurately
- Be friendly, professional, and concise
- Keep responses brief (2-3 sentences max unless asked for more detail)
- If you don't know something, be honest and offer to escalate to a support agent
- Suggest escalation for: complex issues, complaints, billing problems, or if user explicitly asks

SAJI PLATFORM CONTEXT:
- SAJI is a platform connecting clients with professionals (service providers)
- Main features: booking services, payments, ratings/reviews, dispute resolution
- Supported roles: Clients (buyers), Professionals (sellers), Shopkeepers (vendors)

${knowledgeContext}

Now respond helpfully to the customer's question using the above information.`

    // Generate response using Groq
    const { text: aiMessage } = await generateText({
      model: groq("mixtral-8x7b-32768"),
      system: systemPrompt,
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
      knowledgeSources: {
        faqCount: knowledge.faqs.length,
        docCount: knowledge.documents.length,
      },
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
