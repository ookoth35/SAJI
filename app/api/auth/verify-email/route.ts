import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendVerificationEmail } from "@/lib/services/email";
import { createResponse } from "@/lib/auth/auth-utils";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Store verification tokens in memory (in production, use database)
const verificationTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        createResponse(false, "User ID is required"),
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json(
        createResponse(false, "User not found"),
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        createResponse(false, "Email already verified"),
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 86400000; // 24 hours

    // Store token
    verificationTokens.set(verificationToken, {
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    // Create verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`;

    // Send email
    try {
      const firstName = user.fullName?.split(" ")[0] || "User";
      const emailSent = await sendVerificationEmail(
        user.email,
        verificationLink,
        firstName
      );
      console.log("[v0] Verification email:", emailSent ? "sent" : "failed");
    } catch (emailError) {
      console.error("[v0] Failed to send verification email:", emailError);
    }

    return NextResponse.json(
      createResponse(true, "Verification email sent"),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Verification email send error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to send verification email."),
      { status: 500 }
    );
  }
}

// Verify email token
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        createResponse(false, "Token is required"),
        { status: 400 }
      );
    }

    const tokenData = verificationTokens.get(token);

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return NextResponse.json(
        createResponse(false, "Verification link has expired"),
        { status: 400 }
      );
    }

    // Update user email verified status
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, tokenData.userId));

    // Delete token
    verificationTokens.delete(token);

    console.log("[v0] Email verified for user:", tokenData.userId);

    return NextResponse.json(
      createResponse(true, "Email verified successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Email verification error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to verify email."),
      { status: 500 }
    );
  }
}
