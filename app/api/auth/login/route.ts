import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  verifyPassword,
  generateToken,
  createResponse,
} from "@/lib/auth/auth-utils";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        createResponse(false, "Email and password are required"),
        { status: 400 }
      );
    }

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        createResponse(false, "Invalid email or password"),
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        createResponse(false, "Your account has been deactivated"),
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        createResponse(false, "Invalid email or password"),
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        createResponse(false, "Invalid email or password"),
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("[v0] User logged in:", user.id);

    return NextResponse.json(
      createResponse(true, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profileImage: user.profileImage,
        },
        token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      createResponse(false, "Login failed. Please try again later."),
      { status: 500 }
    );
  }
}
