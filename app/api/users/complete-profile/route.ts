import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url().optional(),
  role: z.enum(["client", "professional", "shopkeeper"]).optional(),
  // OAuth fields
  oauthMethod: z.enum(["google", "apple"]).optional(),
  googleId: z.string().optional(),
  appleId: z.string().optional(),
  accessToken: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = updateProfileSchema.parse(body)

    console.log("[v0] Completing profile for:", { email: validated.email, method: validated.oauthMethod })

    // Get the token from Authorization header
    const authHeader = request.headers.get("authorization")
    let decoded: any = null
    let existingUser = null

    // If we have an auth token, verify it
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1]
        if (token) {
          decoded = jwt.verify(token, process.env.JWT_SECRET!)
          existingUser = await db.query.users.findFirst({
            where: eq(users.email, decoded.email),
          })
          console.log("[v0] User found via token:", decoded.email)
        }
      } catch (err) {
        console.warn("[v0] Token verification failed, treating as OAuth flow")
      }
    }

    // If no existing user and we have OAuth data, create new user
    if (!existingUser && validated.oauthMethod && validated.email) {
      console.log("[v0] Creating new user from OAuth:", validated.oauthMethod)

      // Check if user already exists by email
      const existingByEmail = await db.query.users.findFirst({
        where: eq(users.email, validated.email),
      })

      if (existingByEmail) {
        console.log("[v0] User already exists, updating profile")
        existingUser = existingByEmail
      } else {
        // Create new user from OAuth
        const newUser = await db
          .insert(users)
          .values({
            email: validated.email,
            firstName: validated.firstName,
            lastName: validated.lastName,
            phone: validated.phone,
            bio: validated.bio || "",
            role: (validated.role || "client") as "client" | "professional" | "shopkeeper",
            profileImage: validated.profileImage,
            googleId: validated.googleId,
            appleId: validated.appleId,
            passwordHash: null, // OAuth users don't have passwords
            emailVerified: new Date(), // OAuth emails are pre-verified
            profileCompletedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()

        console.log("[v0] New OAuth user created:", newUser[0].id)

        // Generate JWT token for new user
        const newToken = jwt.sign(
          { id: newUser[0].id, email: newUser[0].email },
          process.env.JWT_SECRET!,
          { expiresIn: "30d" }
        )

        return NextResponse.json({
          message: "Profile created successfully",
          token: newToken,
          user: {
            id: newUser[0].id,
            email: newUser[0].email,
            firstName: newUser[0].firstName,
            lastName: newUser[0].lastName,
            phone: newUser[0].phone,
            bio: newUser[0].bio,
            role: newUser[0].role,
          },
        })
      }
    }

    // If still no user, return error
    if (!existingUser) {
      console.error("[v0] No user found and no valid OAuth data provided")
      return NextResponse.json(
        { error: "Unauthorized or invalid request" },
        { status: 401 }
      )
    }

    // Update existing user profile
    console.log("[v0] Updating profile for user:", existingUser.id)

    const updatedUser = await db
      .update(users)
      .set({
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || existingUser.phone,
        bio: validated.bio,
        profileImage: validated.profileImage,
        role: (validated.role || existingUser.role) as "client" | "professional" | "shopkeeper",
        googleId: validated.googleId || existingUser.googleId,
        appleId: validated.appleId || existingUser.appleId,
        profileCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingUser.id))
      .returning()

    console.log("[v0] Profile updated successfully for user:", existingUser.id)

    // Return response with token if needed
    let token = null
    if (validated.oauthMethod) {
      token = jwt.sign(
        { id: updatedUser[0].id, email: updatedUser[0].email },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" }
      )
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      token,
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        firstName: updatedUser[0].firstName,
        lastName: updatedUser[0].lastName,
        phone: updatedUser[0].phone,
        bio: updatedUser[0].bio,
        role: updatedUser[0].role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors[0])
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error("[v0] Profile completion error:", error)
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    )
  }
}
