import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { eq } from "drizzle-orm";

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
});

type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

export async function GET(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader ?? undefined);

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

    // Get user profile
    const user = await db.query.users.findFirst({
      where: eq(users.id, String(decoded.userId)),
    });

    if (!user) {
      return NextResponse.json(
        createResponse(false, "User not found"),
        { status: 404 }
      );
    }

    console.log(" User profile retrieved:", decoded.userId);

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      createResponse(true, "Profile retrieved", {
        user: userWithoutPassword,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(" Profile retrieval error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve profile"),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader ?? undefined);

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

    const body: UpdateProfilePayload = await req.json();

    // Validate input
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const { firstName, lastName, phone, bio, profileImage } = validation.data;

    // Build update object (only include fields that are provided)
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // Update user
    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, String(decoded.userId)))
      .returning();

    console.log("User profile updated:", decoded.userId);

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = updatedUser[0];

    return NextResponse.json(
      createResponse(true, "Profile updated successfully", {
        user: userWithoutPassword,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      createResponse(false, "Profile update failed"),
      { status: 500 }
    );
  }
}
