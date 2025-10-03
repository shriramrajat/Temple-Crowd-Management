import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling authentication and route protection
 * This runs on the Edge Runtime before pages are rendered
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
  ];
  
  // Define public routes that should redirect to dashboard if authenticated
  const publicRoutes = [
    '/login',
    '/signup',
  ];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route
  );
  
  // TODO: Implement actual authentication checking
  // This would typically involve:
  // 1. Reading authentication tokens from cookies
  // 2. Validating tokens (possibly with Firebase Admin SDK)
  // 3. Determining authentication status
  
  // For now, we'll let the client-side AuthGuard handle the protection
  // This middleware serves as a placeholder for future server-side auth
  
  // Example of how you might handle redirects:
  /*
  const isAuthenticated = await checkAuthToken(request);
  
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  */
  
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
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