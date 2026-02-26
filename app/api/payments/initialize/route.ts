import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { payments, bookings } from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { initializeMpesaPayment } from "@/lib/services/mpesa";
import { initializeAirtelPayment } from "@/lib/services/airtel";
import { eq } from "drizzle-orm";

const paymentSchema = z.object({
  bookingId: z.number(),
  phoneNumber: z.string(),
  method: z.enum(["mpesa", "airtel"]),
  amount: z.number().positive(),
});

type PaymentPayload = z.infer<typeof paymentSchema>;

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

    const body: PaymentPayload = await req.json();

    // Validate input
    const validation = paymentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const { bookingId, phoneNumber, method, amount } = validation.data;

    // Verify booking exists and belongs to user
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        createResponse(false, "Booking not found"),
        { status: 404 }
      );
    }

    if (booking.clientId !== decoded.userId) {
      return NextResponse.json(
        createResponse(false, "Forbidden"),
        { status: 403 }
      );
    }

    // Create payment record
    const paymentRecord = await db
      .insert(payments)
      .values({
        bookingId,
        userId: decoded.userId,
        amount,
        method: method as any,
        status: "processing",
        phoneNumber,
      })
      .returning();

    console.log("Payment record created:", paymentRecord[0].id);

    let paymentResponse;

    // Initialize payment with selected provider
    if (method === "mpesa") {
      paymentResponse = await initializeMpesaPayment(
        phoneNumber,
        amount,
        `booking_${bookingId}`,
        `SAJI-${bookingId}`
      );

      console.log(" M-Pesa response:", paymentResponse);

      // Update payment with M-Pesa checkout request ID
      if (paymentResponse.CheckoutRequestID) {
        await db
          .update(payments)
          .set({
            transactionId: paymentResponse.CheckoutRequestID,
          })
          .where(eq(payments.id, paymentRecord[0].id));
      }
    } else if (method === "airtel") {
      paymentResponse = await initializeAirtelPayment(
        phoneNumber,
        amount,
        `booking_${bookingId}`,
        `SAJI-${bookingId}`
      );

      console.log("Airtel response:", paymentResponse);

      // Update payment with Airtel transaction ID
      if (paymentResponse.data?.transaction_id) {
        await db
          .update(payments)
          .set({
            transactionId: paymentResponse.data.transaction_id,
            airtelReference: paymentResponse.data.transaction_id,
          })
          .where(eq(payments.id, paymentRecord[0].id));
      }
    }

    return NextResponse.json(
      createResponse(true, "Payment initiated", {
        paymentId: paymentRecord[0].id,
        transactionId: paymentRecord[0].transactionId,
        message: paymentResponse?.CustomerMessage || paymentResponse?.message,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(" Payment initialization error:", error);
    return NextResponse.json(
      createResponse(false, "Payment initialization failed"),
      { status: 500 }
    );
  }
}
