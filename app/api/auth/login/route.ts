import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  comparePassword,
  generateToken,
  createResponse,
} from "@/lib/auth";
import { eq } from "drizzle-orm";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginPayload = z.infer<typeof loginSchema>;

export async function POST(req: NextRequest) {
  try {
    const body: LoginPayload = await req.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json(
        createResponse(false, "Invalid credentials"),
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        createResponse(false, "Account is inactive"),
        { status: 403 }
      );
    }

    // Compare password
    if (!user.passwordHash) {
      return NextResponse.json(
        createResponse(false, "Invalid credentials"),
        { status: 401 }
      );
    }
    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        createResponse(false, "Invalid credentials"),
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: parseInt(user.id, 10),
      email: user.email,
      role: user.role,
    });

    console.log(" User logged in:", user.id);

    return NextResponse.json(
      createResponse(true, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
        token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(" Login error:", error);
    return NextResponse.json(
      createResponse(false, "Login failed"),
      { status: 500 }
    );
  }
}
