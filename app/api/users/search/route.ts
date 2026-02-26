import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, professionalProfiles } from "@/lib/db/schema";
import { eq, ilike, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const role = searchParams.get("role");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions: any[] = [];

    if (query) {
      whereConditions.push(
        ilike(users.firstName, `%${query}%`),
        ilike(users.lastName, `%${query}%`),
        ilike(users.email, `%${query}%`)
      );
    }

    if (role) {
      whereConditions.push(eq(users.role, role as any));
    }

    const results = await db
      .select()
      .from(users)
      .where(
        whereConditions.length > 0
          ? and(...whereConditions)
          : undefined
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select()
      .from(users)
      .where(
        whereConditions.length > 0
          ? and(...whereConditions)
          : undefined
      );

    return NextResponse.json({
      users: results.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImage: u.profileImage,
        role: u.role,
        status: u.status,
      })),
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
