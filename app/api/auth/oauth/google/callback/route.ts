import { NextRequest, NextResponse } from "next/server"
import { createResponse } from "@/lib/auth/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    console.log("[v0] Google OAuth callback received. Code:", code ? "***" : "missing", "State:", state)

    if (!code) {
      return NextResponse.redirect(
        new URL(`/auth/signup?error=${encodeURIComponent("Authorization code not received")}`, req.url)
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/oauth/google/callback`,
        grant_type: "authorization_code",
      }).toString(),
    })

    const tokenData = await tokenResponse.json()
    console.log("[v0] Token exchange response:", tokenResponse.status)

    if (!tokenResponse.ok) {
      console.error("[v0] Token exchange failed:", tokenData)
      return NextResponse.redirect(
        new URL(
          `/auth/signup?error=${encodeURIComponent(tokenData.error_description || "Token exchange failed")}`,
          req.url
        )
      )
    }

    // Get user info from Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const googleUser = await userInfoResponse.json()
    console.log("[v0] Google user info:", { id: googleUser.id, email: googleUser.email, name: googleUser.name })

    if (!userInfoResponse.ok) {
      console.error("[v0] Failed to get user info:", googleUser)
      return NextResponse.redirect(
        new URL("/auth/signup?error=Failed to retrieve user information", req.url)
      )
    }

    // Parse name into first and last name
    const nameParts = googleUser.name?.split(" ") || ["", ""]
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Create redirect URL with user data
    const params = new URLSearchParams({
      method: "google",
      firstName,
      lastName,
      email: googleUser.email,
      googleId: googleUser.id,
      accessToken: tokenData.access_token,
    })

    console.log("[v0] Redirecting to complete-profile with Google user data")

    return NextResponse.redirect(
      new URL(`/auth/complete-profile?${params.toString()}`, req.url)
    )
  } catch (error) {
    console.error("[v0] Google OAuth callback error:", error)
    return NextResponse.redirect(
      new URL(
        `/auth/signup?error=${encodeURIComponent("An error occurred during Google signup")}`,
        req.url
      )
    )
  }
}
