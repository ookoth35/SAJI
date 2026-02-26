import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, customers } from "@/lib/db/schema";
import {
  hashPassword,
  generateToken,
  createResponse,
} from "@/lib/auth/auth-utils";
import { sendWelcomeEmail } from "@/lib/services/email";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password, role = "client" } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        createResponse(false, "Missing required fields"),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        createResponse(false, "Email already registered"),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        fullName: `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        passwordHash: hashedPassword,
        role: role as any,
        isActive: true,
      })
      .returning();

    console.log("[v0] User created:", newUser[0].id);

    // Create customer profile if role is client
    if (role === "client") {
      await db.insert(customers).values({
        userId: newUser[0].id,
      });
      console.log("[v0] Customer profile created");
    }

    // Generate token
    const token = await generateToken({
      userId: newUser[0].id,
      email: newUser[0].email,
      role: newUser[0].role,
    });

    console.log("[v0] Token generated for:", email);

    // Send welcome email
    try {
      const emailSent = await sendWelcomeEmail(email, firstName);
      console.log("[v0] Welcome email sent:", emailSent ? "success" : "failed");
    } catch (emailError) {
      console.error("[v0] Failed to send welcome email:", emailError);
      // Don't fail the signup if email fails, just log it
    }

    return NextResponse.json(
      createResponse(true, "Signup successful", {
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          fullName: newUser[0].fullName,
          role: newUser[0].role,
        },
        token,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Signup error:", error);
    return NextResponse.json(
      createResponse(false, "Signup failed. Please try again later."),
      { status: 500 }
    );
  }
}
