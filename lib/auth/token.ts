/**
 * Token Verification Utilities
 * 
 * Provides functions for creating and verifying authentication tokens
 * for WebSocket and API authentication.
 * 
 * Requirements: 6.3
 */

import { UserSession } from './session';

/**
 * Create an authentication token from a session
 * 
 * In production, use JWT with proper signing and expiration.
 * This is a simplified implementation for development.
 * 
 * @param session User session data
 * @returns Authentication token
 */
export function createAuthToken(session: UserSession): string {
  const tokenData = {
    ...session,
    exp: Date.now() + (60 * 60 * 1000), // 1 hour expiration
  };

  // In production, use JWT library to sign the token
  return Buffer.from(JSON.stringify(tokenData), 'utf-8').toString('base64');
}

/**
 * Verify an authentication token
 * 
 * @param token Authentication token
 * @returns User session if valid, null otherwise
 */
export async function verifyAuthToken(token: string): Promise<UserSession | null> {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);

    // Check expiration
    if (tokenData.exp && tokenData.exp < Date.now()) {
      console.warn('Token expired');
      return null;
    }

    // Validate session structure
    if (!tokenData.userId || !tokenData.email || !tokenData.role) {
      console.warn('Invalid token structure');
      return null;
    }

    // Return session without expiration field
    const { exp, ...session } = tokenData;
    return session as UserSession;
  } catch (error) {
    console.error('Failed to verify token:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}
