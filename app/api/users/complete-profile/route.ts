import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import jwt from "jsonwebtoken";

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  role: z.enum(["client", "professional"]).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ Step 1: Get the token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Step 2: Verify JWT
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!); // Make sure JWT_SECRET is in your .env
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Step 3: Use decoded.email to find the user
    const user = await db.query.users.findFirst({
      where: eq(users.email, decoded.email),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ✅ Step 4: Validate request body
    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    // ✅ Step 5: Update user
    const updatedUser = await db
      .update(users)
      .set({
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        bio: validated.bio,
        profileImage: validated.profileImage,
        role: validated.role ? (validated.role === "professional" ? "professional" : "client") : user.role,
        profileCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        firstName: updatedUser[0].firstName,
        lastName: updatedUser[0].lastName,
        phone: updatedUser[0].phone,
        bio: updatedUser[0].bio,
        profileImage: updatedUser[0].profileImage,
        role: updatedUser[0].role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}