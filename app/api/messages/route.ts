import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

const sendMessageSchema = z.object({
  recipientId: z.number(),
  content: z.string().min(1, "Message content required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = sendMessageSchema.parse(body);

    const sender = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recipient = await db.query.users.findFirst({
      where: eq(users.id, validated.recipientId),
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Generate conversation ID (sorted user IDs)
    const conversationId = [sender.id, recipient.id].sort().join("-");

    const newMessage = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: sender.id,
        recipientId: recipient.id,
        content: validated.content,
        isRead: false,
      })
      .returning();

    return NextResponse.json({
      message: "Message sent successfully",
      data: newMessage[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let whereConditions: any[] = [
      or(
        eq(messages.senderId, user.id),
        eq(messages.recipientId, user.id)
      ),
    ];

    if (conversationId) {
      whereConditions.push(eq(messages.conversationId, conversationId));
    }

    const messageList = await db
      .select()
      .from(messages)
      .where(and(...whereConditions))
      .orderBy(messages.createdAt)
      .limit(limit)
      .offset(offset);

    // Mark messages as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.recipientId, user.id),
          eq(messages.isRead, false)
        )
      );

    return NextResponse.json({
      messages: messageList,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
