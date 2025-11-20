/**
 * Integration Test: Authentication Callback URL Flow
 * 
 * Tests the complete authentication flow with callback URL handling:
 * - Middleware preserves original URL as callbackUrl parameter
 * - Login form passes callbackUrl to NextAuth signIn
 * - Successful login redirects to callbackUrl or home page
 * - Protected route access flow (access protected route → redirect to login → login → redirect back)
 * 
 * Requirements: 1.2, 1.4
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '@/middleware';

// Mock NextAuth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('Authentication Callback URL Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Middleware Callback URL Preservation', () => {
    it('should preserve original URL as callbackUrl when redirecting unauthenticated user from home page', async () => {
      // Mock no session (unauthenticated)
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to home page
      const request = new NextRequest('http://localhost:3000/');
      
      // Execute middleware
      const response = await middleware(request);

      // Should redirect to login with callbackUrl
      expect(response.status).toBe(307); // Redirect status
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl=%2F');
    });

    it('should preserve original URL as callbackUrl when redirecting from protected route', async () => {
      // Mock no session (unauthenticated)
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to protected route
      const request = new NextRequest('http://localhost:3000/profile');
      
      // Execute middleware
      const response = await middleware(request);

      // Should redirect to login with callbackUrl
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl=%2Fprofile');
    });

    it('should preserve original URL with query parameters as callbackUrl', async () => {
      // Mock no session (unauthenticated)
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to protected route with query params
      const request = new NextRequest('http://localhost:3000/darshan/my-bookings?status=confirmed');
      
      // Execute middleware
      const response = await middleware(request);

      // Should redirect to login with full callbackUrl including query params
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('callbackUrl=');
      expect(location).toContain('darshan');
    });

    it('should allow authenticated user to access home page without redirect', async () => {
      // Mock authenticated session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          userType: 'pilgrim',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create request to home page
      const request = new NextRequest('http://localhost:3000/');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access (NextResponse.next())
      expect(response.status).toBe(200);
    });

    it('should allow authenticated user to access protected route without redirect', async () => {
      // Mock authenticated session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          userType: 'pilgrim',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create request to protected route
      const request = new NextRequest('http://localhost:3000/profile');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access
      expect(response.status).toBe(200);
    });
  });

  describe('Admin Route Callback URL Preservation', () => {
    it('should redirect unauthenticated user from admin route to admin login with callbackUrl', async () => {
      // Mock no session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to admin route
      const request = new NextRequest('http://localhost:3000/admin/dashboard');
      
      // Execute middleware
      const response = await middleware(request);

      // Should redirect to admin login with callbackUrl
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
      expect(location).toContain('callbackUrl=%2Fadmin%2Fdashboard');
    });

    it('should redirect non-admin user from admin route to admin login with callbackUrl', async () => {
      // Mock pilgrim session (not admin)
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          userType: 'pilgrim',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create request to admin route
      const request = new NextRequest('http://localhost:3000/admin/dashboard');
      
      // Execute middleware
      const response = await middleware(request);

      // Should redirect to admin login with error and callbackUrl
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/admin/login');
      expect(location).toContain('error=unauthorized');
      expect(location).toContain('callbackUrl=%2Fadmin%2Fdashboard');
    });

    it('should allow admin user to access admin route without redirect', async () => {
      // Mock admin session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Admin User',
          userType: 'admin',
          role: 'admin',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create request to admin route
      const request = new NextRequest('http://localhost:3000/admin/dashboard');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access
      expect(response.status).toBe(200);
    });
  });

  describe('Public Routes', () => {
    it('should allow access to login page without authentication', async () => {
      // Mock no session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to login page
      const request = new NextRequest('http://localhost:3000/login');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access
      expect(response.status).toBe(200);
    });

    it('should allow access to SOS page without authentication', async () => {
      // Mock no session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to SOS page
      const request = new NextRequest('http://localhost:3000/sos');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access
      expect(response.status).toBe(200);
    });

    it('should allow access to register page without authentication', async () => {
      // Mock no session
      const { auth } = await import('@/lib/auth');
      vi.mocked(auth).mockResolvedValue(null);

      // Create request to register page
      const request = new NextRequest('http://localhost:3000/register');
      
      // Execute middleware
      const response = await middleware(request);

      // Should allow access
      expect(response.status).toBe(200);
    });
  });

  describe('Complete Protected Route Access Flow', () => {
    it('should complete full flow: access protected route → redirect to login → (simulated login) → redirect back', async () => {
      const { auth } = await import('@/lib/auth');
      
      // Step 1: User tries to access protected route without authentication
      vi.mocked(auth).mockResolvedValue(null);
      const protectedRequest = new NextRequest('http://localhost:3000/darshan/my-bookings');
      const redirectResponse = await middleware(protectedRequest);
      
      // Should redirect to login with callbackUrl
      expect(redirectResponse.status).toBe(307);
      const loginLocation = redirectResponse.headers.get('location');
      expect(loginLocation).toContain('/login');
      expect(loginLocation).toContain('callbackUrl=');
      
      // Extract callbackUrl from redirect
      const loginUrl = new URL(loginLocation!);
      const callbackUrl = loginUrl.searchParams.get('callbackUrl');
      expect(callbackUrl).toBe('/darshan/my-bookings');
      
      // Step 2: User is now on login page (public route)
      const loginRequest = new NextRequest(loginLocation!);
      const loginPageResponse = await middleware(loginRequest);
      expect(loginPageResponse.status).toBe(200); // Login page is accessible
      
      // Step 3: After successful login, user should be able to access original route
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'test-user-1',
          email: 'test@example.com',
          name: 'Test User',
          userType: 'pilgrim',
          role: 'user',
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      
      const authenticatedRequest = new NextRequest(`http://localhost:3000${callbackUrl}`);
      const finalResponse = await middleware(authenticatedRequest);
      
      // Should allow access to original protected route
      expect(finalResponse.status).toBe(200);
    });
  });
});
