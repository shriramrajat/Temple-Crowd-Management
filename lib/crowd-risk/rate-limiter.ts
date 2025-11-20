/**
 * Rate Limiter
 * 
 * Implements rate limiting for API endpoints to prevent abuse.
 * Task 15.2: Implement rate limiting middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit entry
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter configuration
 */
export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate Limiter class
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: Required<RateLimiterConfig>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: RateLimiterConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
    };

    // Start cleanup interval to remove expired entries
    this.startCleanup();
  }

  /**
   * Default key generator (uses IP address)
   */
  private defaultKeyGenerator(request: NextRequest): string {
    // Try to get real IP from headers (for proxied requests)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
      return realIp;
    }

    // Fallback to a default key
    return 'unknown';
  }

  /**
   * Check if request should be rate limited
   * 
   * @param request - Next.js request object
   * @returns Rate limit info
   */
  check(request: NextRequest): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetAt: number;
  } {
    const key = this.config.keyGenerator(request);
    const now = Date.now();
    
    let entry = this.store.get(key);

    // Create new entry if doesn't exist or expired
    if (!entry || entry.resetAt <= now) {
      entry = {
        count: 0,
        resetAt: now + this.config.windowMs,
      };
      this.store.set(key, entry);
    }

    // Check if limit exceeded
    const allowed = entry.count < this.config.maxRequests;
    
    // Increment count if request will be allowed
    if (allowed) {
      entry.count++;
    }

    return {
      allowed,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetAt: entry.resetAt,
    };
  }

  /**
   * Middleware function to apply rate limiting
   * 
   * @param request - Next.js request object
   * @returns NextResponse if rate limited, null otherwise
   */
  middleware(request: NextRequest): NextResponse | null {
    const result = this.check(request);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      headers.set('Retry-After', retryAfter.toString());

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    return null; // Request allowed
  }

  /**
   * Reset rate limit for a specific key
   * 
   * @param request - Next.js request object
   */
  reset(request: NextRequest): void {
    const key = this.config.keyGenerator(request);
    this.store.delete(key);
  }

  /**
   * Start cleanup interval to remove expired entries
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Stop cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current store size
   */
  getStoreSize(): number {
    return this.store.size;
  }
}

/**
 * Create a rate limiter with specified configuration
 * 
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @param options - Additional configuration options
 * @returns RateLimiter instance
 */
export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
  options?: Partial<RateLimiterConfig>
): RateLimiter {
  return new RateLimiter({
    maxRequests,
    windowMs,
    ...options,
  });
}

/**
 * Pre-configured rate limiters for common use cases
 */

/**
 * Strict rate limiter for sensitive operations (5 requests per minute)
 */
export const strictRateLimiter = createRateLimiter(5, 60000);

/**
 * Standard rate limiter for configuration endpoints (10 requests per minute)
 */
export const standardRateLimiter = createRateLimiter(10, 60000);

/**
 * Lenient rate limiter for read operations (100 requests per minute)
 */
export const lenientRateLimiter = createRateLimiter(100, 60000);

/**
 * SSE connection rate limiter (10 connections per minute per IP)
 */
export const sseConnectionLimiter = createRateLimiter(10, 60000);
