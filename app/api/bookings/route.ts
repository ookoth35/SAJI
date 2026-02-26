import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

const createBookingSchema = z.object({
  professionalId: z.number(),
  serviceId: z.number(),
  bookingDate: z.string().datetime(),
  duration: z.number().positive(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

type CreateBookingPayload = z.infer<typeof createBookingSchema>;

export async function POST(req: NextRequest) {
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

    const body: CreateBookingPayload = await req.json();

    // Validate input
    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const {
      professionalId,
      serviceId,
      bookingDate,
      duration,
      notes,
      location,
    } = validation.data;

    // Generate booking code
    const bookingCode = `BK-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)
      .toUpperCase()}`;

    // Create booking (you'll need to calculate totalAmount based on service pricing)
    // For now, using a placeholder value
    const totalAmount = duration * 100; // Example: 100 KES per minute

    const newBooking = await db
      .insert(bookings)
      .values({
        bookingCode,
        clientId: decoded.userId,
        professionalId,
        serviceId,
        bookingDate: new Date(bookingDate),
        duration,
        totalAmount,
        notes: notes || null,
        location: location || null,
        status: "pending",
      })
      .returning();

    console.log(" Booking created:", newBooking[0].id);

    return NextResponse.json(
      createResponse(true, "Booking created successfully", {
        booking: newBooking[0],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      createResponse(false, "Booking creation failed"),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    // Get user's bookings
    const userBookings = await db.query.bookings.findMany({
      where: eq(bookings.clientId, decoded.userId),
    });

    console.log("Retrieved bookings for user:", decoded.userId);

    return NextResponse.json(
      createResponse(true, "Bookings retrieved", {
        bookings: userBookings,
        count: userBookings.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking retrieval error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve bookings"),
      { status: 500 }
    );
  }
}
