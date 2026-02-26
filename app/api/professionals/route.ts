import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  professionalProfiles,
  users,
  wallets,
} from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { eq } from "drizzle-orm";

const createProfessionalSchema = z.object({
  title: z.string().min(5),
  specializations: z.array(z.string()).optional(),
  experience: z.number().min(0).optional(),
  certifications: z.array(z.string()).optional(),
  responseTime: z.number().optional(),
});

type CreateProfessionalPayload = z.infer<typeof createProfessionalSchema>;

export async function POST(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

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

    // Only allow professionals or admin to create profiles
    if (decoded.role !== "professional" && decoded.role !== "admin") {
      return NextResponse.json(
        createResponse(false, "Forbidden"),
        { status: 403 }
      );
    }

    const body: CreateProfessionalPayload = await req.json();

    // Validate input
    const validation = createProfessionalSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    const {
      title,
      specializations,
      experience,
      certifications,
      responseTime,
    } = validation.data;

    // Check if professional profile already exists
    const existingProfile =
      await db.query.professionalProfiles.findFirst({
        where: eq(professionalProfiles.userId, decoded.userId),
      });

    if (existingProfile) {
      return NextResponse.json(
        createResponse(
          false,
          "Professional profile already exists for this user"
        ),
        { status: 409 }
      );
    }

    // Create professional profile
    const newProfile = await db
      .insert(professionalProfiles)
      .values({
        userId: decoded.userId,
        title,
        specializations: specializations || null,
        experience: experience || null,
        certifications: certifications || null,
        responseTime: responseTime || 24, // Default 24 hours
        verificationStatus: "unverified",
      })
      .returning();

    console.log("Professional profile created:", newProfile[0].id);

    // Create wallet for professional
    await db
      .insert(wallets)
      .values({
        userId: decoded.userId,
        balance: "0",
      })
      .onConflictDoNothing();

    return NextResponse.json(
      createResponse(true, "Professional profile created", {
        profile: newProfile[0],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(" Professional profile creation error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to create professional profile"),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

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

    // Get professional profile for current user
    const profile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, decoded.userId),
    });

    if (!profile) {
      return NextResponse.json(
        createResponse(false, "Professional profile not found"),
        { status: 404 }
      );
    }

    console.log("Professional profile retrieved:", profile.id);

    return NextResponse.json(
      createResponse(true, "Professional profile retrieved", {
        profile,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(" Profile retrieval error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve professional profile"),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Verify auth token
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

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

    // Get current profile
    const profile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, decoded.userId),
    });

    if (!profile) {
      return NextResponse.json(
        createResponse(false, "Professional profile not found"),
        { status: 404 }
      );
    }

    const body = await req.json();

    // Update only provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.title) updateData.title = body.title;
    if (body.specializations)
      updateData.specializations = body.specializations;
    if (body.experience !== undefined) updateData.experience = body.experience;
    if (body.certifications) updateData.certifications = body.certifications;
    if (body.responseTime) updateData.responseTime = body.responseTime;

    // Update profile
    const updatedProfile = await db
      .update(professionalProfiles)
      .set(updateData)
      .where(eq(professionalProfiles.id, profile.id))
      .returning();

    console.log("Professional profile updated:", profile.id);

    return NextResponse.json(
      createResponse(true, "Professional profile updated", {
        profile: updatedProfile[0],
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to update professional profile"),
      { status: 500 }
    );
  }
}
