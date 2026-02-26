import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/services/email";
import { createResponse } from "@/lib/auth/auth-utils";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Store reset tokens in memory (in production, use database)
const resetTokens = new Map<string, { userId: string; email: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        createResponse(false, "Email is required"),
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        createResponse(true, "If an account exists with this email, you will receive password reset instructions."),
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 3600000; // 1 hour

    // Store token
    resetTokens.set(resetToken, {
      userId: user.id,
      email: user.email,
      expiresAt,
    });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    try {
      const firstName = user.fullName?.split(" ")[0] || "User";
      const emailSent = await sendPasswordResetEmail(
        user.email,
        resetLink,
        firstName
      );
      console.log("[v0] Password reset email:", emailSent ? "sent" : "failed");
    } catch (emailError) {
      console.error("[v0] Failed to send password reset email:", emailError);
    }

    return NextResponse.json(
      createResponse(true, "If an account exists with this email, you will receive password reset instructions."),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Password reset request error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to process request. Please try again later."),
      { status: 500 }
    );
  }
}

// Verify token
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

    const tokenData = resetTokens.get(token);

    if (!tokenData || tokenData.expiresAt < Date.now()) {
      return NextResponse.json(
        createResponse(false, "Reset link has expired"),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createResponse(true, "Token is valid", { email: tokenData.email }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Token verification error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to verify token."),
      { status: 500 }
    );
  }
}
