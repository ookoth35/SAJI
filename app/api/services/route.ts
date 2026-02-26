import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { services, professionalProfiles } from "@/lib/db/schema";
import { createResponse, verifyToken, getTokenFromHeader } from "@/lib/auth";
import { eq, ilike } from "drizzle-orm";

const createServiceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  category: z.string().min(2),
  basePrice: z.number().positive(),
  duration: z.number().positive().optional(),
  availability: z.record(z.any()).optional(),
});

type CreateServicePayload = z.infer<typeof createServiceSchema>;

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

    // Only professionals can create services
    if (decoded.role !== "professional") {
      return NextResponse.json(
        createResponse(false, "Only professionals can create services"),
        { status: 403 }
      );
    }

    const body: CreateServicePayload = await req.json();

    // Validate input
    const validation = createServiceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        createResponse(false, "Validation failed", validation.error.errors),
        { status: 400 }
      );
    }

    // Get professional profile
    const professionalProfile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, decoded.userId),
    });

    if (!professionalProfile) {
      return NextResponse.json(
        createResponse(false, "Professional profile not found"),
        { status: 404 }
      );
    }

    const { name, description, category, basePrice, duration, availability } =
      validation.data;

    // Create service
    const newService = await db
      .insert(services)
      .values({
        professionalId: professionalProfile.id,
        name,
        description: description || null,
        category,
        basePrice,
        duration: duration || 60, // Default 60 minutes
        availability: availability || null,
        isActive: true,
      })
      .returning();

    console.log("Service created:", newService[0].id);

    return NextResponse.json(
      createResponse(true, "Service created successfully", {
        service: newService[0],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Service creation error:", error);
    return NextResponse.json(
      createResponse(false, "Service creation failed"),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get search parameters
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let query = db.query.services.findMany({
      where: (service) => {
        let conditions = [];

        if (category) {
          conditions.push(ilike(service.category, `%${category}%`));
        }

        if (search) {
          conditions.push(ilike(service.name, `%${search}%`));
        }

        if (conditions.length === 0) return undefined;
        if (conditions.length === 1) return conditions[0];

        return db.sql`${conditions[0]} AND ${conditions[1]}`;
      },
    }) as any;

    const allServices = await query;

    console.log(" Retrieved services:", allServices.length);

    return NextResponse.json(
      createResponse(true, "Services retrieved", {
        services: allServices,
        count: allServices.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Service retrieval error:", error);
    return NextResponse.json(
      createResponse(false, "Failed to retrieve services"),
      { status: 500 }
    );
  }
}
