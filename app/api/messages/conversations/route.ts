import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, or, sql, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get unique conversations with the latest message
    const conversations = await db.execute(
      sql`
        SELECT DISTINCT ON (m.conversation_id)
          m.conversation_id,
          m.content,
          m.created_at,
          m.is_read,
          m.sender_id,
          m.recipient_id,
          u.id as other_user_id,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.email
        FROM messages m
        LEFT JOIN users u ON (
          CASE 
            WHEN m.sender_id = ${user.id} THEN m.recipient_id = u.id
            ELSE m.sender_id = u.id
          END
        )
        WHERE m.sender_id = ${user.id} OR m.recipient_id = ${user.id}
        ORDER BY m.conversation_id, m.created_at DESC
        LIMIT 50
      `
    );

    return NextResponse.json({
      conversations: conversations.rows || [],
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
