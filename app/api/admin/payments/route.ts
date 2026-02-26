import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { payments, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function checkAdminAccess(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !["admin", "sub_admin"].includes(user.role)) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await checkAdminAccess(session.user.email);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");

    let whereConditions: any[] = [];
    if (status) {
      whereConditions.push(eq(payments.status, status as any));
    }

    const paymentList = await db
      .select()
      .from(payments)
      .limit(limit)
      .offset(offset);

    const total = await db.select().from(payments);

    const stats = {
      totalPayments: total.length,
      completedAmount: total
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + Number(p.amount), 0),
      failedAmount: total
        .filter((p) => p.status === "failed")
        .reduce((sum, p) => sum + Number(p.amount), 0),
      pendingAmount: total
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + Number(p.amount), 0),
    };

    return NextResponse.json({
      payments: paymentList,
      stats,
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
