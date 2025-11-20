




/**
 * Next.js Middleware for Route Protection
 * 
 * Protects admin and user routes by verifying authentication and authorization.
 * Redirects unauthorized users to appropriate login pages with return URL preservation.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Public routes that don't require authentication
 * Requirements: 3.1, 3.2
 * 
 * These routes are accessible to all users without authentication:
 * - SOS emergency page
 * - Login and registration pages
 * - Password reset flows
 */
const PUBLIC_ROUTES = [
  '/sos',
  '/login',
  '/register',
  '/admin/login',
  '/forgot-password',
  '/reset-password',
  '/api',
  '/_next',
  '/favicon.ico',
];

/**
 * Login page paths for redirects
 */
const ADMIN_LOGIN_PATH = '/admin/login';
const USER_LOGIN_PATH = '/login';

/**
 * Check if a route is public (doesn't require authentication)
 * 
 * @param pathname Request pathname
 * @returns true if route is public
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if a route requires admin authentication
 * Requirements: 3.3
 * 
 * @param pathname Request pathname
 * @returns true if route requires admin auth
 */
function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login';
}

/**
 * Check if a route requires user authentication
 * Requirements: 3.4
 * 
 * @param pathname Request pathname
 * @returns true if route requires user auth
 */
function isUserRoute(pathname: string): boolean {
  // Protected user routes
  const userRoutePatterns = [
    '/profile',
    '/darshan/my-bookings',
    '/darshan/confirmation',
    '/(authenticated)',
  ];

  return userRoutePatterns.some(route => pathname.startsWith(route));
}

/**
 * Middleware function
 * 
 * Validates sessions using NextAuth auth() helper and implements
 * role-based access control with proper redirects.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Requirement 3.2: Allow public routes without authentication (except login pages)
  // Public routes: home, SOS, register, password reset
  const isLoginPage = pathname === '/login' || pathname === '/admin/login';
  if (isPublicRoute(pathname) && !isLoginPage) {
    return NextResponse.next();
  }

  // Validate session using NextAuth auth() helper
  // Requirement 3.1: Properly validate sessions
  const session = await auth();

  // Redirect authenticated users away from login pages
  if (isLoginPage && session) {
    const redirectPath = session.user.userType === 'admin' ? '/admin' : '/';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Allow unauthenticated access to login pages
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Requirement 3.3: Admin route protection with userType verification
  if (isAdminRoute(pathname)) {
    if (!session || !session.user) {
      // No session, redirect to admin login with return URL
      // Requirement 3.5: Implement proper redirects with return URL preservation
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify user type is admin
    if (session.user.userType !== 'admin') {
      // Not an admin, redirect to admin login with error
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated and authorized as admin, allow access
    return NextResponse.next();
  }

  // Requirement 3.4: User route protection with userType verification
  if (isUserRoute(pathname)) {
    if (!session || !session.user) {
      // No session, redirect to user login with return URL
      // Requirement 3.5: Implement proper redirects with return URL preservation
      const loginUrl = new URL(USER_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify user type is pilgrim
    if (session.user.userType !== 'pilgrim') {
      // Not a pilgrim user, redirect to user login with error
      const loginUrl = new URL(USER_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated and authorized as pilgrim, allow access
    return NextResponse.next();
  }

  // Home page and other protected routes require authentication
  // Requirement 1.1, 1.2: Redirect unauthenticated users to login with callback URL
  if (!session || !session.user) {
    const loginUrl = new URL(USER_LOGIN_PATH, request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

/**
 * Middleware configuration
 * 
 * Specify which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
