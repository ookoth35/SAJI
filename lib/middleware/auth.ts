import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth";

export interface AuthRequest extends NextRequest {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export function withAuth(handler: (req: AuthRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Attach user to request
    (req as AuthRequest).user = decoded as any;

    return handler(req as AuthRequest);
  };
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(...roles: string[]) {
  return (handler: (req: AuthRequest) => Promise<NextResponse>) => {
    return async (req: AuthRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (!roles.includes(req.user.role)) {
        return NextResponse.json(
          {
            success: false,
            message: `Forbidden - Required roles: ${roles.join(", ")}`,
          },
          { status: 403 }
        );
      }

      return handler(req);
    };
  };
}

/**
 * Middleware to check if professional is verified
 */
export async function requireProfessionalVerification(
  handler: (req: AuthRequest) => Promise<NextResponse>
) {
  return async (req: AuthRequest) => {
    if (!req.user || req.user.role !== "professional") {
      return NextResponse.json(
        { success: false, message: "Forbidden - Not a professional" },
        { status: 403 }
      );
    }

    // Check if professional is verified
    const { db } = await import("@/lib/db");
    const { professionalProfiles } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const profile = await db.query.professionalProfiles.findFirst({
      where: eq(professionalProfiles.userId, req.user.userId),
    });

    if (!profile || profile.verificationStatus !== "verified") {
      return NextResponse.json(
        { success: false, message: "Professional profile not verified" },
        { status: 403 }
      );
    }

    return handler(req);
  };
}
