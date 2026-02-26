import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { professionals, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const professional = await db.query.professionals.findFirst({
      where: eq(professionals.id, parseInt(params.id)),
      with: { user: true },
    });

    if (!professional)
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );

    return NextResponse.json(professional, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch professional" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professional = await db.query.professionals.findFirst({
      where: eq(professionals.id, parseInt(params.id)),
    });

    if (!professional)
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );

    if (professional.userId !== user.id && user.role !== "admin")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );

    const body = await req.json();

    const updated = await db
      .update(professionals)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(professionals.id, parseInt(params.id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update professional" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const professional = await db.query.professionals.findFirst({
      where: eq(professionals.id, parseInt(params.id)),
    });

    if (!professional)
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );

    if (professional.userId !== user.id && user.role !== "admin")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );

    await db.delete(professionals).where(eq(professionals.id, parseInt(params.id)));

    return NextResponse.json({ message: "Professional deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete professional" },
      { status: 500 }
    );
  }
}
