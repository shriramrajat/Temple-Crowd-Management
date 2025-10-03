import { redirect } from 'next/navigation';

/**
 * Utility functions for authentication in server components and middleware
 */

/**
 * Server-side authentication check utility
 * Use this in server components to redirect unauthenticated users
 * 
 * Note: This is a placeholder for server-side auth checking.
 * In a real implementation, you would check authentication tokens
 * from cookies or headers here.
 */
export function requireAuth(redirectTo: string = '/login') {
  // TODO: Implement server-side auth checking
  // This would typically involve:
  // 1. Reading authentication tokens from cookies
  // 2. Validating tokens with Firebase Admin SDK
  // 3. Redirecting if invalid
  
  // For now, this is a placeholder that can be implemented
  // when server-side authentication is needed
}

/**
 * Check if a route should be protected
 * This can be used in middleware to protect multiple routes
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    // Add more protected routes as needed
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get redirect URL for unauthenticated users
 * Includes the current path as a return URL parameter
 */
export function getLoginRedirectUrl(currentPath: string, loginPath: string = '/login'): string {
  const url = new URL(loginPath, 'http://localhost');
  url.searchParams.set('returnUrl', currentPath);
  return url.pathname + url.search;
}

/**
 * Extract return URL from login page
 * Use this to redirect users back to their intended destination after login
 */
export function getReturnUrl(searchParams: URLSearchParams, defaultUrl: string = '/dashboard'): string {
  const returnUrl = searchParams.get('returnUrl');
  
  // Validate return URL to prevent open redirects
  if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
    return returnUrl;
  }
  
  return defaultUrl;
}