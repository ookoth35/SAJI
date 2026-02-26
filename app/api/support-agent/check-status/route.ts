import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supportAgents, users } from "@/lib/db/schema"
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

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, decoded.email),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is a support agent
    const agent = await db.query.supportAgents.findFirst({
      where: eq(supportAgents.userId, user.id),
    })

    if (!agent) {
      return NextResponse.json({
        isAgent: false,
        message: "User is not registered as a support agent",
      })
    }

    console.log("[v0] Agent status check passed for:", user.email)

    return NextResponse.json({
      isAgent: true,
      agent: {
        id: agent.id,
        status: agent.status,
        activeChats: agent.activeChatsCount,
        isAvailable: agent.isAvailable,
      },
    })
  } catch (error) {
    console.error("[v0] Error checking agent status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
