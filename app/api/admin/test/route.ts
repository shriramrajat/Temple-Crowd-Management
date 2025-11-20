import { NextResponse } from "next/server";
import { checkAdminAuth, unauthorizedResponse } from "@/lib/auth-helpers";

/**
 * Example protected admin API route
 * This demonstrates how to use the checkAdminAuth helper
 */
export async function GET() {
  // Check authentication
  const session = await checkAdminAuth();
  
  // If no session, return unauthorized response
  if (!session) {
    return unauthorizedResponse();
  }
  
  return NextResponse.json({
    message: "You are authenticated!",
    user: {
      email: session.user.email,
      role: session.user.role,
    },
  });
}
