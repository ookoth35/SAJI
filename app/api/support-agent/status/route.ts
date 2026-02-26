import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { supportAgents, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
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

    const body = await req.json()
    const { status } = body

    if (!["online", "offline", "busy", "on_break"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
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

    // Update agent status
    const isAvailable = status === "online"
    const updatedAgent = await db
      .update(supportAgents)
      .set({
        status: status as "online" | "offline" | "busy" | "on_break",
        isAvailable,
        lastActivityAt: new Date(),
      })
      .where(eq(supportAgents.id, agent.id))
      .returning()

    console.log("[v0] Agent status updated:", agent.id, "Status:", status)

    return NextResponse.json({
      message: "Status updated",
      agent: {
        id: updatedAgent[0].id,
        status: updatedAgent[0].status,
        isAvailable: updatedAgent[0].isAvailable,
      },
    })
  } catch (error) {
    console.error("[v0] Error updating agent status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
