import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendPasswordResetEmail, sendPasswordResetCodeSMS } from "@/lib/services/email";
import { createResponse } from "@/lib/auth/auth-utils";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Store reset codes in memory (in production, use database with expiration)
const resetCodes = new Map<string, { userId: string; email: string; phone?: string; code: string; method: "email" | "phone"; expiresAt: number; verified: boolean }>();

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send code via email
async function sendCodeViaEmail(email: string, code: string): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Code</h1>
        </div>
        
        <p>Hi,</p>
        <p>We received a request to reset your password. Use the code below to verify your identity:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; border: 2px dashed #667eea;">
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; font-family: monospace;">
              ${code}
            </p>
          </div>
        </div>
        
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes for security.</p>
        
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
          <p style="margin: 0; color: #856404; font-size: 13px;"><strong>Security:</strong> Never share this code with anyone. SAJI support will never ask for it.</p>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
        
        <p>Best regards,<br/>SAJI Security Team</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Password Reset Code - SAJI",
      html,
    });

    console.log("[v0] Reset code email sent:", result);
    return !result.error;
  } catch (error) {
    console.error("[v0] Error sending reset code email:", error);
    return false;
  }
}

// Step 1: Request password reset (send code)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, method = "email" } = body

    if (!email && !phone) {
      return NextResponse.json(
        createResponse(false, "Email or phone is required"),
        { status: 400 }
      )
    }

    if (!method || !["email", "phone"].includes(method)) {
      return NextResponse.json(
        createResponse(false, "Method must be 'email' or 'phone'"),
        { status: 400 }
      )
    }

    console.log("[v0] Password reset request via:", method)

    try {
      // Find user
      let user
      if (method === "email" && email) {
        user = await db.query.users.findFirst({
          where: eq(users.email, email),
        })
      } else if (method === "phone" && phone) {
        user = await db.query.users.findFirst({
          where: eq(users.phone, phone),
        })
      }

      if (!user) {
        // Security: Don't reveal if account exists
        console.log("[v0] User not found")
        return NextResponse.json(
          createResponse(true, "If an account exists, you will receive a verification code."),
          { status: 200 }
        )
      }

      // Generate reset code
      const code = generateCode()
      const identifier = method === "email" ? user.email : user.phone
      const expiresAt = Date.now() + 600000 // 10 minutes

      // Store code
      const codeKey = crypto.randomBytes(16).toString("hex")
      resetCodes.set(codeKey, {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        code,
        method,
        expiresAt,
        verified: false,
      })

      console.log("[v0] Reset code generated for:", identifier)

      // Send code
      let codeSent = false
      let sendError = ""
      
      console.log("[v0] Attempting to send code via:", method, "to:", identifier)
      
      if (method === "email") {
        codeSent = await sendCodeViaEmail(user.email, code)
        if (!codeSent) {
          sendError = "Failed to send email code"
        }
      } else if (method === "phone" && user.phone) {
        codeSent = await sendPasswordResetCodeSMS(user.phone, code)
        if (!codeSent) {
          sendError = "Failed to send SMS code"
        }
      } else if (method === "phone" && !user.phone) {
        sendError = "User phone number not found"
        console.log("[v0] User phone not found")
      }

      if (!codeSent) {
        console.error("[v0] Code sending failed:", sendError)
        return NextResponse.json(
          createResponse(false, sendError || "Failed to send code. Please try again."),
          { status: 500 }
        )
      }

      console.log("[v0] Code sent successfully to:", identifier)

      return NextResponse.json(
        createResponse(true, "Verification code sent successfully", {
          codeKey,
          maskedIdentifier: method === "email" 
            ? user.email.replace(/(.{2})(.*)(.{2})/, "$1***$3")
            : user.phone?.replace(/(.{2})(.*)(.{3})/, "$1****$3"),
        }),
        { status: 200 }
      )
    } catch (dbError) {
      console.error("[v0] Database or service error:", dbError)
      return NextResponse.json(
        createResponse(false, "Service unavailable. Please try again later."),
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("[v0] Password reset request error:", error)
    return NextResponse.json(
      createResponse(false, "Failed to process request."),
      { status: 500 }
    )
  }
}

// Step 2: Verify code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { codeKey, code } = body

    if (!codeKey || !code) {
      return NextResponse.json(
        createResponse(false, "Code key and verification code are required"),
        { status: 400 }
      )
    }

    try {
      const codeData = resetCodes.get(codeKey)

      if (!codeData) {
        return NextResponse.json(
          createResponse(false, "Invalid or expired session"),
          { status: 400 }
        )
      }

      if (codeData.expiresAt < Date.now()) {
        resetCodes.delete(codeKey)
        return NextResponse.json(
          createResponse(false, "Verification code has expired"),
          { status: 400 }
        )
      }

      if (codeData.code !== code) {
        return NextResponse.json(
          createResponse(false, "Invalid verification code"),
          { status: 400 }
        )
      }

      // Mark as verified
      codeData.verified = true
      resetCodes.set(codeKey, codeData)

      console.log("[v0] Code verified for user:", codeData.userId)

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

      return NextResponse.json(
        createResponse(true, "Code verified successfully", {
          resetToken,
          resetLink,
        }),
        { status: 200 }
      )
    } catch (serviceError) {
      console.error("[v0] Service error during code verification:", serviceError)
      return NextResponse.json(
        createResponse(false, "Service unavailable. Please try again."),
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("[v0] Code verification error:", error)
    return NextResponse.json(
      createResponse(false, "Failed to verify code."),
      { status: 500 }
    )
  }
}

// Step 3: Reset password
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { codeKey, newPassword, confirmPassword } = body

    if (!codeKey || !newPassword || !confirmPassword) {
      return NextResponse.json(
        createResponse(false, "All fields are required"),
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        createResponse(false, "Passwords do not match"),
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        createResponse(false, "Password must be at least 8 characters"),
        { status: 400 }
      )
    }

    try {
      const codeData = resetCodes.get(codeKey)

      if (!codeData || !codeData.verified) {
        return NextResponse.json(
          createResponse(false, "Please verify your code first"),
          { status: 400 }
        )
      }

      if (codeData.expiresAt < Date.now()) {
        resetCodes.delete(codeKey)
        return NextResponse.json(
          createResponse(false, "Session has expired"),
          { status: 400 }
        )
      }

      try {
        // Hash password
        const bcrypt = require("bcryptjs")
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update user password
        await db.execute(
          `UPDATE users SET password_hash = ? WHERE id = ?`,
          [hashedPassword, codeData.userId]
        )

        console.log("[v0] Password updated for user:", codeData.userId)

        // Send confirmation email
        try {
          const firstName = "User"
          await sendPasswordResetEmail(
            codeData.email,
            "",
            firstName
          )
        } catch (emailError) {
          console.error("[v0] Error sending password reset confirmation:", emailError)
        }

        // Clean up
        resetCodes.delete(codeKey)

        return NextResponse.json(
          createResponse(true, "Password reset successfully"),
          { status: 200 }
        )
      } catch (dbError) {
        console.error("[v0] Database error during password update:", dbError)
        return NextResponse.json(
          createResponse(false, "Failed to update password. Please try again."),
          { status: 503 }
        )
      }
    } catch (serviceError) {
      console.error("[v0] Service error during password reset:", serviceError)
      return NextResponse.json(
        createResponse(false, "Service unavailable. Please try again."),
        { status: 503 }
      )
    }
  } catch (error) {
    console.error("[v0] Password reset error:", error)
    return NextResponse.json(
      createResponse(false, "Failed to reset password."),
      { status: 500 }
    )
  }
}
