import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { faqArticles, knowledgeDocuments } from "@/lib/db/schema"
import jwt from "jsonwebtoken"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  try {
    // Check authorization - only admins can create FAQs
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

    // Verify admin role
    const user = await db.query.users.findFirst({
      where: eq(users.email, decoded.email),
    })

    if (!user || (user.role !== "admin" && user.role !== "sub_admin")) {
      return NextResponse.json({ error: "Only admins can manage FAQs" }, { status: 403 })
    }

    const body = await req.json()
    const { type, category, question, answer, keywords, title, content, fileUrl } = body

    if (type === "faq") {
      if (!question || !answer || !category) {
        return NextResponse.json(
          { error: "Missing required fields: question, answer, category" },
          { status: 400 }
        )
      }

      const faq = await db
        .insert(faqArticles)
        .values({
          category,
          question,
          answer,
          keywords: keywords || "",
          createdBy: user.id,
        })
        .returning()

      console.log("[v0] FAQ created:", faq[0].id)

      return NextResponse.json({
        message: "FAQ created successfully",
        faq: faq[0],
      })
    } else if (type === "document") {
      if (!title || !content || !category) {
        return NextResponse.json(
          { error: "Missing required fields: title, content, category" },
          { status: 400 }
        )
      }

      const doc = await db
        .insert(knowledgeDocuments)
        .values({
          title,
          category,
          content,
          fileUrl: fileUrl || null,
          createdBy: user.id,
        })
        .returning()

      console.log("[v0] Document created:", doc[0].id)

      return NextResponse.json({
        message: "Document created successfully",
        document: doc[0],
      })
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'faq' or 'document'" }, { status: 400 })
    }
  } catch (error) {
    console.error("[v0] Error creating knowledge base item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
