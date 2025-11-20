/**
 * Authentication Helper Functions
 * Provides utilities for checking authentication in API routes
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { APIError } from "@/lib/types/api";

/**
 * Check if the current user is authenticated as admin
 * 
 * Verifies that the user has admin userType as per requirements 5.4, 5.5
 * 
 * @returns Session if authenticated as admin, null otherwise
 */
export async function checkAdminAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }
  
  // Requirement 5.4, 5.5: Verify admin role on all admin API endpoints
  // Check userType instead of role for proper admin verification
  const userType = session.user.userType;
  if (userType !== "admin") {
    return null;
  }
  
  return session;
}

/**
 * Create an unauthorized error response
 * 
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse() {
  const error: APIError = {
    error: "Unauthorized",
    message: "Authentication required. Please log in to access this resource.",
    statusCode: 401,
  };
  
  return NextResponse.json(error, { status: 401 });
}

/**
 * Create a forbidden error response
 * 
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse() {
  const error: APIError = {
    error: "Forbidden",
    message: "You do not have permission to access this resource.",
    statusCode: 403,
  };
  
  return NextResponse.json(error, { status: 403 });
}
