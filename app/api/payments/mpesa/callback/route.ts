import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, bookings, users } from "@/lib/db/schema";
import { processMpesaCallback } from "@/lib/services/mpesa";
import { sendPaymentConfirmation } from "@/lib/services/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(" M-Pesa callback received:", JSON.stringify(body, null, 2));

    // Process M-Pesa callback
    const result = processMpesaCallback(body);

    if (result.success && result.mpesaCode) {
      // Find the payment record by CheckoutRequestID
      const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;

      if (!checkoutRequestId) {
        console.log("No CheckoutRequestID in callback");
        return NextResponse.json(
          { ResultCode: "1", ResultDesc: "No CheckoutRequestID" },
          { status: 400 }
        );
      }

      // Update payment status
      const payment = await db.query.payments.findFirst({
        where: eq(payments.transactionId, checkoutRequestId),
      });

      if (payment) {
        // Update payment as completed
        await db
          .update(payments)
          .set({
            status: "completed",
            mpesaCode: result.mpesaCode,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        // Update booking status to confirmed
        await db
          .update(bookings)
          .set({
            status: "confirmed",
            updatedAt: new Date(),
          })
          .where(eq(bookings.id, payment.bookingId));

        console.log("Payment marked as completed:", payment.id);

        // Get user email to send confirmation
        const bookingData = await db.query.bookings.findFirst({
          where: eq(bookings.id, payment.bookingId),
        });

        if (bookingData) {
          const user = await db.query.users.findFirst({
            where: eq(users.id, payment.userId),
          });

          if (user) {
            await sendPaymentConfirmation(
              user.email,
              result.mpesaCode,
              Number(payment.amount),
              "M-Pesa"
            );
          }
        }
      } else {
        console.log(" Payment record not found for:", checkoutRequestId);
      }
    } else {
      console.log("M-Pesa payment failed:", result.message);

      // Find and update payment as failed
      const checkoutRequestId = body.Body?.stkCallback?.CheckoutRequestID;
      if (checkoutRequestId) {
        const payment = await db.query.payments.findFirst({
          where: eq(payments.transactionId, checkoutRequestId),
        });

        if (payment) {
          await db
            .update(payments)
            .set({
              status: "failed",
              failureReason: result.message,
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));
        }
      }
    }

    // Return success response to M-Pesa
    return NextResponse.json(
      {
        ResultCode: "0",
        ResultDesc: "Received Successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(" M-Pesa callback error:", error);
    return NextResponse.json(
      {
        ResultCode: "1",
        ResultDesc: "Error processing callback",
      },
      { status: 500 }
    );
  }
}
