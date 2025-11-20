/**
 * API Security Middleware
 * Provides reusable middleware functions for API route protection
 * Requirements: Task 24 - Comprehensive security measures
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientIP, type RateLimiter, type RateLimitResult } from './rate-limiter';
import { csrfProtection } from './csrf';
import type { APIError } from '@/lib/types/api';

/**
 * Apply rate limiting to an API route
 * 
 * @param request - Next.js request object
 * @param rateLimiter - Rate limiter instance
 * @returns Rate limit result or error response
 */
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter
): Promise<{ allowed: true; result: RateLimitResult } | { allowed: false; response: NextResponse }> {
  const clientIP = getClientIP(request.headers);
  const rateLimitResult = rateLimiter.check(clientIP);

  if (!rateLimitResult.allowed) {
    const error: APIError = {
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${rateLimitResult.resetIn} seconds.`,
      statusCode: 429,
      details: {
        limit: rateLimitResult.limit,
        remaining: rateLimitResult.remaining,
        resetIn: rateLimitResult.resetIn,
      },
    };

    return {
      allowed: false,
      response: NextResponse.json(error, {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetIn.toString(),
        },
      }),
    };
  }

  return { allowed: true, result: rateLimitResult };
}

/**
 * Apply CSRF protection to an API route
 * Only validates for state-changing methods (POST, PUT, DELETE)
 * 
 * @param request - Next.js request object
 * @returns CSRF validation result or error response
 */
export async function applyCSRFProtection(
  request: NextRequest
): Promise<{ valid: true } | { valid: false; response: NextResponse }> {
  const result = await csrfProtection(request);

  if (!result.valid) {
    const error: APIError = {
      error: 'Forbidden',
      message: result.error || 'CSRF validation failed',
      statusCode: 403,
    };

    return {
      valid: false,
      response: NextResponse.json(error, { status: 403 }),
    };
  }

  return { valid: true };
}

/**
 * Validate request body size to prevent DoS attacks
 * 
 * @param body - Request body
 * @param maxSizeBytes - Maximum allowed size in bytes (default: 1MB)
 * @returns Validation result or error response
 */
export function validateRequestBodySize(
  body: unknown,
  maxSizeBytes: number = 1024 * 1024 // 1MB
): { valid: true } | { valid: false; response: NextResponse } {
  const bodyString = JSON.stringify(body);
  const bodySizeBytes = Buffer.byteLength(bodyString, 'utf8');

  if (bodySizeBytes > maxSizeBytes) {
    const error: APIError = {
      error: 'Payload Too Large',
      message: `Request body exceeds maximum size of ${maxSizeBytes} bytes`,
      statusCode: 413,
    };

    return {
      valid: false,
      response: NextResponse.json(error, { status: 413 }),
    };
  }

  return { valid: true };
}

/**
 * Validate content type
 * 
 * @param request - Next.js request object
 * @param allowedTypes - Array of allowed content types
 * @returns Validation result or error response
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[] = ['application/json']
): { valid: true } | { valid: false; response: NextResponse } {
  const contentType = request.headers.get('content-type');

  if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
    const error: APIError = {
      error: 'Unsupported Media Type',
      message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
      statusCode: 415,
    };

    return {
      valid: false,
      response: NextResponse.json(error, { status: 415 }),
    };
  }

  return { valid: true };
}

/**
 * Add security headers to response
 * 
 * @param response - Next.js response object
 * @returns Response with security headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy (basic)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

/**
 * Comprehensive security middleware
 * Applies multiple security measures in one call
 * 
 * @param request - Next.js request object
 * @param options - Security options
 * @returns Security validation result or error response
 */
export async function applySecurityMiddleware(
  request: NextRequest,
  options: {
    rateLimiter?: RateLimiter;
    enableCSRF?: boolean;
    maxBodySize?: number;
    allowedContentTypes?: string[];
  } = {}
): Promise<{ valid: true } | { valid: false; response: NextResponse }> {
  // Apply rate limiting if configured
  if (options.rateLimiter) {
    const rateLimitResult = await applyRateLimit(request, options.rateLimiter);
    if (!rateLimitResult.allowed) {
      return { valid: false, response: rateLimitResult.response };
    }
  }

  // Apply CSRF protection if enabled
  if (options.enableCSRF) {
    const csrfResult = await applyCSRFProtection(request);
    if (!csrfResult.valid) {
      return { valid: false, response: csrfResult.response };
    }
  }

  // Validate content type for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentTypeResult = validateContentType(
      request,
      options.allowedContentTypes
    );
    if (!contentTypeResult.valid) {
      return { valid: false, response: contentTypeResult.response };
    }
  }

  return { valid: true };
}
