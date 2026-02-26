import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  hashPassword,
  generateToken,
  createResponse,
} from "@/lib/auth";
import { eq } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/services/email";

const signupSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["admin", "professional", "client", "shopkeeper"]).default("client"),
});

type SignupPayload = z.infer<typeof signupSchema>;

export async function POST(req: NextRequest) {
  try {
    const body: SignupPayload = await req.json();

    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const { email, firstName, lastName, password, phone, role } = validation.data;

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
        email,
        fullName: `${firstName} ${lastName}`,
        passwordHash: hashedPassword,
        phone: phone || null,
        role: role as any,
        isActive: true,
      })
      .returning();

    console.log(" User created:", newUser[0].id);

    // Generate token
    const token = generateToken({
      userId: parseInt(newUser[0].id),
      email: newUser[0].email,
      role: newUser[0].role,
    });

    // Send welcome email
    await sendWelcomeEmail(email, firstName);

    console.log(" Welcome email sent to:", email);

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
    console.error("Signup error:", error);
    return NextResponse.json(
      createResponse(false, "Signup failed"),
      { status: 500 }
    );
  }
}
