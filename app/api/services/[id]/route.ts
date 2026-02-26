import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verifyAuth } from "@/lib/auth";

const updateServiceSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  basePrice: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = updateServiceSchema.parse(body);

    const service = await db.query.services.findFirst({
      where: eq(services.id, parseInt(params.id)),
    });

    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    if (service.professionalId !== user.id && user.role !== "admin")
      return NextResponse.json(
        { error: "You can only update your own services" },
        { status: 403 }
      );

    const updated = await db
      .update(services)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(services.id, parseInt(params.id)))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const service = await db.query.services.findFirst({
      where: eq(services.id, parseInt(params.id)),
    });

    if (!service)
      return NextResponse.json({ error: "Service not found" }, { status: 404 });

    if (service.professionalId !== user.id && user.role !== "admin")
      return NextResponse.json(
        { error: "You can only delete your own services" },
        { status: 403 }
      );

    await db.delete(services).where(eq(services.id, parseInt(params.id)));

    return NextResponse.json({ message: "Service deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
