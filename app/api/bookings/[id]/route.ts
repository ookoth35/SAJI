import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        createResponse(false, "Unauthorized"),
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        createResponse(false, "Invalid token"),
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        createResponse(false, "Invalid booking ID"),
        { status: 400 }
      );
    }

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        createResponse(false, "Booking not found"),
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.clientId !== decoded.userId && decoded.role !== "admin") {
      return NextResponse.json(
        createResponse(false, "Forbidden"),
        { status: 403 }
      );
    }

    console.log(" Booking retrieved:", bookingId);

    return NextResponse.json(
      createResponse(true, "Booking retrieved", { booking }),
      { status: 200 }
    );
  } catch (error) {
    console.error(" Error retrieving booking:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve booking"),
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        createResponse(false, "Unauthorized"),
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        createResponse(false, "Invalid token"),
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        createResponse(false, "Invalid booking ID"),
        { status: 400 }
      );
    }

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        createResponse(false, "Booking not found"),
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.clientId !== decoded.userId) {
      return NextResponse.json(
        createResponse(false, "Forbidden"),
        { status: 403 }
      );
    }

    const body = await req.json();
    const { notes, location, bookingDate } = body;

    // Update booking
    const updatedBooking = await db
      .update(bookings)
      .set({
        notes: notes || booking.notes,
        location: location || booking.location,
        bookingDate: bookingDate ? new Date(bookingDate) : booking.bookingDate,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    console.log(" Booking updated:", bookingId);

    return NextResponse.json(
      createResponse(true, "Booking updated", { booking: updatedBooking[0] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      createResponse(false, "Failed to update booking"),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        createResponse(false, "Unauthorized"),
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        createResponse(false, "Invalid token"),
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json(
        createResponse(false, "Invalid booking ID"),
        { status: 400 }
      );
    }

    // Get booking
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        createResponse(false, "Booking not found"),
        { status: 404 }
      );
    }

    // Verify user owns this booking
    if (booking.clientId !== decoded.userId) {
      return NextResponse.json(
        createResponse(false, "Forbidden"),
        { status: 403 }
      );
    }

    // Update status to cancelled instead of deleting
    const cancelledBooking = await db
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    console.log("Booking cancelled:", bookingId);

    return NextResponse.json(
      createResponse(true, "Booking cancelled", {
        booking: cancelledBooking[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      createResponse(false, "Failed to cancel booking"),
      { status: 500 }
    );
  }
}
