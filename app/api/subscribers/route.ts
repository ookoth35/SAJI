import { NextRequest, NextResponse } from 'next/server'
import { db } from "@/lib/db";
import { sendNewsletterSubscriptionEmail } from "@/lib/services/email";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, deviceId, subscribedAt } = await request.json()

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log("[v0] Newsletter subscription request for:", email);

    // Check if email is already subscribed
    try {
      const existingSubscriber = await db.execute(
        sql`SELECT * FROM newsletter_subscribers WHERE LOWER(email) = LOWER(${email}) AND is_active = TRUE LIMIT 1`
      );

      if (existingSubscriber.rows && existingSubscriber.rows.length > 0) {
        console.log("[v0] Email already subscribed:", email);
        return NextResponse.json(
          { success: false, message: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      }
    } catch (checkError) {
      console.log("[v0] Newsletter table might not exist, creating...");
      
      // Create table if it doesn't exist
      try {
        await db.execute(
          sql`
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
              id SERIAL PRIMARY KEY,
              email VARCHAR(255) UNIQUE NOT NULL,
              subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              device_id VARCHAR(255),
              is_active BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
          `
        );
        console.log("[v0] Newsletter table created successfully");
      } catch (createError) {
        console.error("[v0] Error creating newsletter table:", createError);
      }
    }

    // Insert subscriber into database
    try {
      await db.execute(
        sql`
          INSERT INTO newsletter_subscribers (email, subscribed_at, device_id, is_active)
          VALUES (${email}, NOW(), ${deviceId || null}, TRUE)
        `
      );
      console.log("[v0] Subscriber added to database:", email);
    } catch (insertError) {
      console.error("[v0] Error inserting subscriber:", insertError);
      
      // Try to update if exists and inactive
      try {
        await db.execute(
          sql`
            UPDATE newsletter_subscribers 
            SET is_active = TRUE, subscribed_at = NOW() 
            WHERE LOWER(email) = LOWER(${email})
          `
        );
        console.log("[v0] Reactivated existing subscriber:", email);
      } catch (updateError) {
        console.error("[v0] Error updating subscriber:", updateError);
      }
    }

    // Send welcome email
    let emailSent = false;
    try {
      emailSent = await sendNewsletterSubscriptionEmail(email);
      console.log("[v0] Newsletter confirmation email:", emailSent ? "sent successfully" : "failed");
    } catch (emailError) {
      console.error("[v0] Error sending newsletter email:", emailError);
      // Don't fail the subscription if email fails, user is still subscribed
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent 
          ? 'Subscription successful! Check your inbox for confirmation.' 
          : 'Subscription successful! You will receive updates soon.',
        data: {
          email,
          subscribedAt: subscribedAt || new Date().toISOString(),
          emailSent,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, message: 'Subscription failed. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    console.log("[v0] Checking subscription status for:", email);

    const result = await db.execute(
      sql`SELECT * FROM newsletter_subscribers WHERE LOWER(email) = LOWER(${email}) AND is_active = TRUE LIMIT 1`
    );

    const isSubscribed = result.rows && result.rows.length > 0;

    return NextResponse.json(
      {
        success: true,
        isSubscribed,
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error checking subscription:", error);
    return NextResponse.json(
      { success: false, message: 'Error checking subscription status' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter is required' },
        { status: 400 }
      );
    }

    console.log("[v0] Unsubscribe request for:", email);

    await db.execute(
      sql`UPDATE newsletter_subscribers SET is_active = FALSE WHERE LOWER(email) = LOWER(${email})`
    );

    console.log("[v0] Unsubscribed:", email);

    return NextResponse.json(
      {
        success: true,
        message: 'You have been unsubscribed from our newsletter',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error unsubscribing:", error);
    return NextResponse.json(
      { success: false, message: 'Error unsubscribing' },
      { status: 500 }
    );
  }
}
