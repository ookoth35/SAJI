import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { wallets, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    let wallet = await db.query.wallets.findFirst({
      where: eq(wallets.userId, user.id),
    });

    // Create wallet if it doesn't exist
    if (!wallet) {
      const newWallet = await db
        .insert(wallets)
        .values({
          userId: user.id,
          balance: "0",
        })
        .returning();
      wallet = newWallet[0];
    }

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        balance: wallet.balance,
        lastUpdated: wallet.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Get wallet error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
