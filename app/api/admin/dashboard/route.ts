import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { users, bookings, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Admin middleware
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

    // Get dashboard statistics
    const totalUsers = await db.select().from(users);
    const totalBookings = await db.select().from(bookings);
    const totalPayments = await db.select().from(payments);

    const completedBookings = totalBookings.filter(
      (b) => b.status === "completed"
    );
    const totalRevenue = totalPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers.length,
        totalBookings: totalBookings.length,
        completedBookings: completedBookings.length,
        totalRevenue,
        pendingBookings: totalBookings.filter((b) => b.status === "pending").length,
        failedPayments: totalPayments.filter((p) => p.status === "failed").length,
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
