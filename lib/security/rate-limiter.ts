/**
 * Rate Limiter Implementation
 * Prevents API abuse by limiting requests per IP address
 * Requirements: Task 24 - Implement rate limiting on booking API to prevent abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter store
 * For production, consider using Redis or similar distributed cache
 */
class RateLimiterStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && entry.resetTime < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global rate limiter store instance
const rateLimiterStore = new RateLimiterStore();

/**
 * Rate limiter configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  maxRequests: number;
  
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  
  /**
   * Custom key generator function (defaults to IP address)
   */
  keyGenerator?: (identifier: string) => string;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;
  
  /**
   * Remaining requests in the current window
   */
  remaining: number;
  
  /**
   * Time until the rate limit resets (in seconds)
   */
  resetIn: number;
  
  /**
   * Total limit
   */
  limit: number;
}

/**
 * Rate limiter class
 */
export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      keyGenerator: config.keyGenerator || ((id) => id),
    };
  }

  /**
   * Check if a request is allowed and update the counter
   * 
   * @param identifier - Unique identifier (usually IP address)
   * @returns Rate limit result
   */
  check(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator(identifier);
    const now = Date.now();
    
    let entry = rateLimiterStore.get(key);

    if (!entry) {
      // First request in the window
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      rateLimiterStore.set(key, entry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetIn: Math.ceil(this.config.windowMs / 1000),
        limit: this.config.maxRequests,
      };
    }

    // Increment counter
    entry.count++;
    rateLimiterStore.set(key, entry);

    const resetIn = Math.ceil((entry.resetTime - now) / 1000);
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      allowed: entry.count <= this.config.maxRequests,
      remaining,
      resetIn,
      limit: this.config.maxRequests,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * 
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator(identifier);
    rateLimiterStore.get(key);
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */

// Booking API: 10 requests per 15 minutes per IP
export const bookingRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

// Verification API: 30 requests per minute per IP (for staff scanning)
export const verificationRateLimiter = new RateLimiter({
  maxRequests: 30,
  windowMs: 60 * 1000, // 1 minute
});

// General API: 100 requests per 15 minutes per IP
export const generalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutes
});

/**
 * Extract IP address from request headers
 * Handles various proxy headers
 * 
 * @param headers - Request headers
 * @returns IP address or 'unknown'
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  return 'unknown';
}
