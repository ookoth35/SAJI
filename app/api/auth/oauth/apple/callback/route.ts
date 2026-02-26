import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const user = searchParams.get("user")

    console.log("[v0] Apple OAuth callback received. Code:", code ? "***" : "missing")

    if (!code) {
      return NextResponse.redirect(
        new URL(`/auth/signup?error=${encodeURIComponent("Authorization code not received")}`, req.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
        client_secret: process.env.APPLE_CLIENT_SECRET || "",
        grant_type: "authorization_code",
      }).toString(),
    })

    const tokenData = await tokenResponse.json()
    console.log("[v0] Apple token exchange response:", tokenResponse.status)

    if (!tokenResponse.ok) {
      console.error("[v0] Apple token exchange failed:", tokenData)
      return NextResponse.redirect(
        new URL(
          `/auth/signup?error=${encodeURIComponent(tokenData.error || "Token exchange failed")}`,
          req.url
        )
      )
    }

    // Decode ID token to get user info
    let appleUser = { id: "", email: "", name: { firstName: "", lastName: "" } }

    if (tokenData.id_token) {
      try {
        const decoded = jwt.decode(tokenData.id_token)
        appleUser = {
          id: decoded?.sub || "",
          email: decoded?.email || "",
          name: {
            firstName: decoded?.firstName || "",
            lastName: decoded?.lastName || "",
          },
        }
        console.log("[v0] Apple user info from token:", { id: appleUser.id, email: appleUser.email })
      } catch (decodeError) {
        console.error("[v0] Failed to decode Apple ID token:", decodeError)
      }
    }

    // If user data was provided in the callback (first time auth)
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        appleUser.name.firstName = parsedUser.name?.firstName || ""
        appleUser.name.lastName = parsedUser.name?.lastName || ""
        console.log("[v0] Apple user data from callback:", parsedUser)
      } catch (parseError) {
        console.error("[v0] Failed to parse Apple user data:", parseError)
      }
    }

    if (!appleUser.email) {
      console.error("[v0] No email received from Apple")
      return NextResponse.redirect(
        new URL("/auth/signup?error=Unable to retrieve email from Apple. Please check your Apple ID privacy settings.", req.url)
      )
    }

    // Create redirect URL with user data
    const params = new URLSearchParams({
      method: "apple",
      firstName: appleUser.name.firstName,
      lastName: appleUser.name.lastName,
      email: appleUser.email,
      appleId: appleUser.id,
      accessToken: tokenData.access_token,
    })

    console.log("[v0] Redirecting to complete-profile with Apple user data")

    return NextResponse.redirect(
      new URL(`/auth/complete-profile?${params.toString()}`, req.url)
    )
  } catch (error) {
    console.error("[v0] Apple OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/signup?error=${encodeURIComponent("An error occurred during Apple signup")}`,
        req.url
      )
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[v0] Apple OAuth POST callback received")

    // Handle POST callback (for web-based flow)
    return GET(req)
  } catch (error) {
    console.error("[v0] Apple OAuth POST error:", error)
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    )
  }
}
