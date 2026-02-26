import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { reviews, bookings, users, professionalProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const createReviewSchema = z.object({
  bookingId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    // Verify booking exists and user is the client
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, validated.bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const reviewer = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
    });

    if (!reviewer || booking.clientId !== reviewer.id) {
      return NextResponse.json(
        { error: "You can only review bookings you made" },
        { status: 403 }
      );
    }

    // Create review
    const newReview = await db
      .insert(reviews)
      .values({
        bookingId: validated.bookingId,
        reviewerId: reviewer.id,
        professionalId: booking.professionalId,
        rating: validated.rating,
        comment: validated.comment,
        isAnonymous: validated.isAnonymous || false,
      })
      .returning();

    // Update professional rating
    const profReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.professionalId, booking.professionalId));

    const avgRating =
      profReviews.reduce((sum, r) => sum + r.rating, 0) / profReviews.length;

    await db
      .update(professionalProfiles)
      .set({
        rating: avgRating.toString(),
        totalReviews: profReviews.length,
      })
      .where(eq(professionalProfiles.id, booking.professionalId));

    return NextResponse.json({
      message: "Review created successfully",
      review: newReview[0],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const professionalId = searchParams.get("professionalId");
    const bookingId = searchParams.get("bookingId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let whereConditions: any[] = [];

    if (professionalId) {
      whereConditions.push(
        eq(reviews.professionalId, parseInt(professionalId))
      );
    }

    if (bookingId) {
      whereConditions.push(eq(reviews.bookingId, parseInt(bookingId)));
    }

    const reviewList = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        isAnonymous: reviews.isAnonymous,
        createdAt: reviews.createdAt,
        reviewer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.reviewerId, users.id))
      .where(
        whereConditions.length > 0
          ? and(...whereConditions)
          : undefined
      )
      .limit(limit)
      .offset(offset);

    const total = await db
      .select()
      .from(reviews)
      .where(
        whereConditions.length > 0
          ? and(...whereConditions)
          : undefined
      );

    return NextResponse.json({
      reviews: reviewList,
      pagination: {
        total: total.length,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
