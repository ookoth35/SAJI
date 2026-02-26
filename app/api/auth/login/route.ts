import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  verifyPassword,
  generateToken,
  createResponse,
} from "@/lib/auth/auth-utils";
import { sendLoginNotificationEmail } from "@/lib/services/email";
import { eq } from "drizzle-orm";

async function getLocationFromIP(req: NextRequest): Promise<string> {
  try {
    // Get client IP from headers
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-client-ip") || "unknown"
    
    // Try to get location from IP API
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (!response.ok) throw new Error("Location API failed")
    
    const data = await response.json()
    return `${data.city || "Unknown"}, ${data.region || ""}, ${data.country_name || "Unknown"}`
  } catch (error) {
    console.error("[v0] Failed to get location:", error)
    return "Unknown Location"
  }
}

function getDeviceFromUserAgent(userAgent: string): string {
  let device = "Unknown Device"
  
  if (userAgent.includes("Windows")) {
    device = "Windows PC"
    if (userAgent.includes("Chrome")) device += " (Chrome)"
    else if (userAgent.includes("Firefox")) device += " (Firefox)"
    else if (userAgent.includes("Edge")) device += " (Edge)"
  } else if (userAgent.includes("Mac")) {
    device = "Mac"
    if (userAgent.includes("Chrome")) device += " (Chrome)"
    else if (userAgent.includes("Safari")) device += " (Safari)"
  } else if (userAgent.includes("iPhone")) {
    device = "iPhone"
  } else if (userAgent.includes("iPad")) {
    device = "iPad"
  } else if (userAgent.includes("Android")) {
    device = "Android Phone"
  } else if (userAgent.includes("Linux")) {
    device = "Linux"
  }
  
  return device
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, password } = body;

    // Validate required fields
    if ((!email && !phone) || !password) {
      return NextResponse.json(
        createResponse(false, "Email/phone and password are required"),
        { status: 400 }
      );
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
    } else if (phone) {
      user = await db.query.users.findFirst({
        where: eq(users.phone, phone),
      });
    }

    if (!user) {
      return NextResponse.json(
        createResponse(false, "Invalid email/phone or password"),
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        createResponse(false, "Your account has been deactivated"),
        { status: 403 }
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        createResponse(false, "Invalid email/phone or password"),
        { status: 401 }
      );
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        createResponse(false, "Invalid email/phone or password"),
        { status: 401 }
      );
    }

    // Generate token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    console.log("[v0] User logged in:", user.id);

    // Get device info
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const deviceName = getDeviceFromUserAgent(userAgent)
    
    // Get location from IP
    const location = await getLocationFromIP(req)
    
    // Get timestamp
    const timestamp = new Date().toLocaleString()

    // Send login notification email
    try {
      const firstName = user.fullName?.split(" ")[0] || "User"
      const emailSent = await sendLoginNotificationEmail(
        user.email,
        firstName,
        deviceName,
        location,
        timestamp
      )
      console.log("[v0] Login notification email:", emailSent ? "sent" : "failed")
    } catch (emailError) {
      console.error("[v0] Failed to send login notification:", emailError)
      // Don't fail login if email fails
    }

    return NextResponse.json(
      createResponse(true, "Login successful", {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profileImage: user.profileImage,
        },
        token,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      createResponse(false, "Login failed. Please try again later."),
      { status: 500 }
    );
  }
}
