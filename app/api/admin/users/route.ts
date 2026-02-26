import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function checkAdminAccess(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user || !["admin", "sub_admin"].includes(user.role)) {
    return null;
  }

  return user;
}

const updateUserSchema = z.object({
  role: z.enum(["admin", "sub_admin", "client", "professional", "shopkeeper"]).optional(),
  status: z.enum(["active", "inactive", "suspended", "deleted"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await checkAdminAccess(session.user.email);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const role = searchParams.get("role");

    let whereConditions: any[] = [];
    if (role) {
      whereConditions.push(eq(users.role, role as any));
    }

    const userList = await db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset);

    const total = await db.select().from(users);

    return NextResponse.json({
      users: userList.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
      })),
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await checkAdminAccess(session.user.email);
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, ...updateData } = body;
    const validated = updateUserSchema.parse(updateData);

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await db
      .update(users)
      .set({
        role: validated.role || user.role,
        status: validated.status || user.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        id: updated[0].id,
        email: updated[0].email,
        role: updated[0].role,
        status: updated[0].status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
