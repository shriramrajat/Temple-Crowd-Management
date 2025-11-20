/**
 * CSRF Protection Utilities
 * Implements CSRF token generation and validation for Next.js
 * Requirements: Task 24 - Add CSRF protection using Next.js built-in tokens
 */

import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * CSRF configuration
 */
const CSRF_CONFIG = {
  /**
   * Cookie name for CSRF token
   */
  COOKIE_NAME: 'csrf-token',

  /**
   * Header name for CSRF token
   */
  HEADER_NAME: 'x-csrf-token',

  /**
   * Token length in bytes
   */
  TOKEN_LENGTH: 32,

  /**
   * Cookie options
   */
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  },
} as const;

/**
 * Generate a CSRF token
 * 
 * @returns CSRF token string
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
}

/**
 * Set CSRF token in cookie
 * Should be called on page load or session initialization
 * 
 * @returns Generated CSRF token
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(
    CSRF_CONFIG.COOKIE_NAME,
    token,
    CSRF_CONFIG.COOKIE_OPTIONS
  );

  return token;
}

/**
 * Get CSRF token from cookie
 * 
 * @returns CSRF token or null if not found
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_CONFIG.COOKIE_NAME);
  
  return token?.value || null;
}

/**
 * Validate CSRF token from request
 * Compares token from header with token from cookie
 * 
 * @param headers - Request headers
 * @returns Boolean indicating if token is valid
 */
export async function validateCSRFToken(headers: Headers): Promise<boolean> {
  // Get token from header
  const headerToken = headers.get(CSRF_CONFIG.HEADER_NAME);
  
  if (!headerToken) {
    return false;
  }

  // Get token from cookie
  const cookieToken = await getCSRFToken();
  
  if (!cookieToken) {
    return false;
  }

  // Compare tokens using timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(headerToken),
      Buffer.from(cookieToken)
    );
  } catch {
    // Tokens are different lengths or invalid
    return false;
  }
}

/**
 * CSRF protection middleware for API routes
 * Validates CSRF token for state-changing operations (POST, PUT, DELETE)
 * 
 * @param request - Next.js request object
 * @returns Validation result
 */
export async function csrfProtection(request: Request): Promise<{
  valid: boolean;
  error?: string;
}> {
  const method = request.method;

  // Skip CSRF validation for safe methods (GET, HEAD, OPTIONS)
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true };
  }

  // Validate CSRF token for state-changing methods
  const isValid = await validateCSRFToken(request.headers);

  if (!isValid) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token',
    };
  }

  return { valid: true };
}

/**
 * Get CSRF token for client-side use
 * This should be called from a server component or API route
 * and passed to the client
 * 
 * @returns CSRF token
 */
export async function getOrCreateCSRFToken(): Promise<string> {
  let token = await getCSRFToken();
  
  if (!token) {
    token = await setCSRFToken();
  }

  return token;
}

/**
 * Clear CSRF token
 * Should be called on logout or session end
 */
export async function clearCSRFToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CSRF_CONFIG.COOKIE_NAME);
}

/**
 * Refresh CSRF token
 * Generates a new token and updates the cookie
 * 
 * @returns New CSRF token
 */
export async function refreshCSRFToken(): Promise<string> {
  await clearCSRFToken();
  return await setCSRFToken();
}
