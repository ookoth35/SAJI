import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { faqArticles, knowledgeDocuments } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("q")

    let faqs = await db.select().from(faqArticles).where(eq(faqArticles.isActive, true))

    let docs = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.isActive, true))

    if (category) {
      faqs = faqs.filter((f) => f.category === category)
      docs = docs.filter((d) => d.category === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      faqs = faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchLower) ||
          f.answer.toLowerCase().includes(searchLower) ||
          f.keywords?.toLowerCase().includes(searchLower)
      )
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(searchLower) || d.content.toLowerCase().includes(searchLower)
      )
    }

    console.log("[v0] Knowledge base search:", { category, search, faqCount: faqs.length, docCount: docs.length })

    return NextResponse.json({
      faqs,
      documents: docs,
    })
  } catch (error) {
    console.error("[v0] Error fetching knowledge base:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
