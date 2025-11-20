/**
 * Integration Test: Unauthenticated Home Page Access
 * 
 * Tests that unauthenticated users are properly redirected from the home page:
 * - Accessing home page without auth redirects to login
 * - Callback URL is preserved in redirect
 * 
 * Requirements: 1.1, 1.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

// Mock NextAuth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

describe('Unauthenticated Home Page Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect unauthenticated user from home page to login', async () => {
    // Mock no session (unauthenticated)
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null);

    // Create request to home page
    const request = new NextRequest('http://localhost:3000/');
    
    // Execute middleware
    const response = await middleware(request);

    // Should redirect to login
    expect(response.status).toBe(307); // Redirect status
    const location = response.headers.get('location');
    expect(location).toContain('/login');
  });

  it('should preserve home page URL as callbackUrl when redirecting', async () => {
    // Mock no session (unauthenticated)
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null);

    // Create request to home page
    const request = new NextRequest('http://localhost:3000/');
    
    // Execute middleware
    const response = await middleware(request);

    // Should redirect to login with callbackUrl
    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('callbackUrl=%2F');
  });

  it('should allow authenticated user to access home page', async () => {
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

  it('should preserve callback URL with query parameters', async () => {
    // Mock no session (unauthenticated)
    const { auth } = await import('@/lib/auth');
    vi.mocked(auth).mockResolvedValue(null);

    // Create request to protected route with query params
    const request = new NextRequest('http://localhost:3000/profile?view=dashboard&tab=bookings');
    
    // Execute middleware
    const response = await middleware(request);

    // Should redirect to login with full callbackUrl including query params
    expect(response.status).toBe(307);
    const location = response.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('callbackUrl=');
    
    // Extract and verify callbackUrl
    const loginUrl = new URL(location!);
    const callbackUrl = loginUrl.searchParams.get('callbackUrl');
    expect(callbackUrl).toContain('/profile');
    expect(callbackUrl).toContain('view=dashboard');
    expect(callbackUrl).toContain('tab=bookings');
  });
});
