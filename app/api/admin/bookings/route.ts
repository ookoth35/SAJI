import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { bookings, users, payments } from "@/lib/db/schema";
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

const updateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
});

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
      whereConditions.push(eq(bookings.status, status as any));
    }

    const bookingList = await db
      .select()
      .from(bookings)
      .limit(limit)
      .offset(offset);

    const total = await db.select().from(bookings);

    return NextResponse.json({
      bookings: bookingList,
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await checkAdminAccess(session.user.email);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { bookingId, ...updateData } = body;
    const validated = updateBookingSchema.parse(updateData);

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updated = await db
      .update(bookings)
      .set({
        status: validated.status,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return NextResponse.json({
      message: "Booking updated successfully",
      booking: updated[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
