import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { transactionLogs, users, wallets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const transactions = await db
      .select()
      .from(transactionLogs)
      .where(eq(transactionLogs.userId, user.id))
      .orderBy(transactionLogs.createdAt)
      .limit(limit)
      .offset(offset);

    const total = await db
      .select()
      .from(transactionLogs)
      .where(eq(transactionLogs.userId, user.id));

    return NextResponse.json({
      transactions,
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
