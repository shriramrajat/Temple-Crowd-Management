/**
 * Session Management Utilities
 * 
 * Provides functions for managing user sessions and authentication tokens.
 * This is a simplified implementation - in production, use a proper auth library
 * like NextAuth.js, Auth0, or similar.
 */

import { cookies } from 'next/headers';

export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

/**
 * Session cookie name
 */
const SESSION_COOKIE_NAME = 'session_token';

/**
 * Get the current user session from cookies
 * 
 * @returns User session if authenticated, null otherwise
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return null;
  }

  try {
    // In production, verify JWT token or validate session with database
    // For now, we'll decode a simple base64-encoded JSON token
    const decoded = Buffer.from(sessionToken.value, 'base64').toString('utf-8');
    const session = JSON.parse(decoded) as UserSession;

    // Validate session structure
    if (!session.userId || !session.email || !session.role) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Failed to parse session token:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin
 * 
 * @returns true if user is authenticated and has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === 'admin';
}

/**
 * Create a session token (for testing/development)
 * 
 * @param session User session data
 * @returns Base64-encoded session token
 */
export function createSessionToken(session: UserSession): string {
  const json = JSON.stringify(session);
  return Buffer.from(json, 'utf-8').toString('base64');
}

/**
 * Set session cookie (for testing/development)
 * 
 * @param session User session data
 */
export async function setSession(session: UserSession): Promise<void> {
  const cookieStore = await cookies();
  const token = createSessionToken(session);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get authentication token for API/WebSocket requests
 * 
 * This creates a token from the current session that can be used
 * for Bearer authentication in API requests.
 * 
 * @returns Authentication token or null if not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  // Create token with expiration
  const tokenData = {
    ...session,
    exp: Date.now() + (60 * 60 * 1000), // 1 hour expiration
  };

  return Buffer.from(JSON.stringify(tokenData), 'utf-8').toString('base64');
}
