/**
 * Authentication Rate Limiter
 * Tracks failed login attempts per email and implements account lockout
 * Requirements: 3.3, 3.4 - 5 failed attempts trigger 15-minute lockout
 */

interface LoginAttemptEntry {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptTime: number;
}

/**
 * In-memory store for login attempts
 * For production, consider using Redis or database for persistence
 */
class AuthRateLimiterStore {
  private store: Map<string, LoginAttemptEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    // Remove entries that are unlocked and haven't had attempts in the last hour
    for (const [key, entry] of this.store.entries()) {
      const isUnlocked = !entry.lockedUntil || entry.lockedUntil < now;
      const isStale = now - entry.lastAttemptTime > 60 * 60 * 1000; // 1 hour
      
      if (isUnlocked && isStale) {
        this.store.delete(key);
      }
    }
  }

  get(key: string): LoginAttemptEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: LoginAttemptEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Global auth rate limiter store instance
const authRateLimiterStore = new AuthRateLimiterStore();

/**
 * Configuration for authentication rate limiting
 */
export interface AuthRateLimitConfig {
  /**
   * Maximum failed attempts before lockout
   * @default 5
   */
  maxAttempts: number;

  /**
   * Lockout duration in milliseconds
   * @default 900000 (15 minutes)
   */
  lockoutDuration: number;
}

/**
 * Result of rate limit check
 */
export interface AuthRateLimitResult {
  /**
   * Whether the login attempt is allowed
   */
  allowed: boolean;

  /**
   * Number of failed attempts so far
   */
  failedAttempts: number;

  /**
   * Remaining attempts before lockout
   */
  remainingAttempts: number;

  /**
   * Whether the account is currently locked
   */
  isLocked: boolean;

  /**
   * Time until lockout expires (in seconds), null if not locked
   */
  lockoutExpiresIn: number | null;

  /**
   * Timestamp when lockout expires, null if not locked
   */
  lockedUntil: number | null;
}

/**
 * Authentication Rate Limiter
 * Tracks failed login attempts and implements account lockout
 */
export class AuthRateLimiter {
  private config: AuthRateLimitConfig;

  constructor(config?: Partial<AuthRateLimitConfig>) {
    this.config = {
      maxAttempts: config?.maxAttempts ?? 5,
      lockoutDuration: config?.lockoutDuration ?? 15 * 60 * 1000, // 15 minutes
    };
  }

  /**
   * Normalize email to lowercase for consistent tracking
   */
  private normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Check if a login attempt is allowed for the given email
   * 
   * @param email - User email address
   * @returns Rate limit result
   */
  checkLoginAttempt(email: string): AuthRateLimitResult {
    const key = this.normalizeEmail(email);
    const now = Date.now();
    
    let entry = authRateLimiterStore.get(key);

    // No previous attempts
    if (!entry) {
      return {
        allowed: true,
        failedAttempts: 0,
        remainingAttempts: this.config.maxAttempts,
        isLocked: false,
        lockoutExpiresIn: null,
        lockedUntil: null,
      };
    }

    // Check if account is locked
    if (entry.lockedUntil && entry.lockedUntil > now) {
      const lockoutExpiresIn = Math.ceil((entry.lockedUntil - now) / 1000);
      
      return {
        allowed: false,
        failedAttempts: entry.failedAttempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutExpiresIn,
        lockedUntil: entry.lockedUntil,
      };
    }

    // Lockout has expired, reset the entry
    if (entry.lockedUntil && entry.lockedUntil <= now) {
      authRateLimiterStore.delete(key);
      return {
        allowed: true,
        failedAttempts: 0,
        remainingAttempts: this.config.maxAttempts,
        isLocked: false,
        lockoutExpiresIn: null,
        lockedUntil: null,
      };
    }

    // Account not locked, check remaining attempts
    const remainingAttempts = Math.max(0, this.config.maxAttempts - entry.failedAttempts);
    
    return {
      allowed: remainingAttempts > 0,
      failedAttempts: entry.failedAttempts,
      remainingAttempts,
      isLocked: false,
      lockoutExpiresIn: null,
      lockedUntil: null,
    };
  }

  /**
   * Record a failed login attempt
   * Increments the failure counter and locks account if threshold is reached
   * 
   * @param email - User email address
   * @returns Updated rate limit result
   */
  recordFailedAttempt(email: string): AuthRateLimitResult {
    const key = this.normalizeEmail(email);
    const now = Date.now();
    
    let entry = authRateLimiterStore.get(key);

    if (!entry) {
      // First failed attempt
      entry = {
        failedAttempts: 1,
        lockedUntil: null,
        lastAttemptTime: now,
      };
      authRateLimiterStore.set(key, entry);

      return {
        allowed: true,
        failedAttempts: 1,
        remainingAttempts: this.config.maxAttempts - 1,
        isLocked: false,
        lockoutExpiresIn: null,
        lockedUntil: null,
      };
    }

    // If already locked, don't increment further
    if (entry.lockedUntil && entry.lockedUntil > now) {
      const lockoutExpiresIn = Math.ceil((entry.lockedUntil - now) / 1000);
      
      return {
        allowed: false,
        failedAttempts: entry.failedAttempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutExpiresIn,
        lockedUntil: entry.lockedUntil,
      };
    }

    // Increment failed attempts
    entry.failedAttempts++;
    entry.lastAttemptTime = now;

    // Check if we should lock the account
    if (entry.failedAttempts >= this.config.maxAttempts) {
      entry.lockedUntil = now + this.config.lockoutDuration;
      authRateLimiterStore.set(key, entry);

      const lockoutExpiresIn = Math.ceil(this.config.lockoutDuration / 1000);

      return {
        allowed: false,
        failedAttempts: entry.failedAttempts,
        remainingAttempts: 0,
        isLocked: true,
        lockoutExpiresIn,
        lockedUntil: entry.lockedUntil,
      };
    }

    authRateLimiterStore.set(key, entry);

    const remainingAttempts = this.config.maxAttempts - entry.failedAttempts;

    return {
      allowed: remainingAttempts > 0,
      failedAttempts: entry.failedAttempts,
      remainingAttempts,
      isLocked: false,
      lockoutExpiresIn: null,
      lockedUntil: null,
    };
  }

  /**
   * Reset failed attempts for an email (called on successful login)
   * 
   * @param email - User email address
   */
  resetFailedAttempts(email: string): void {
    const key = this.normalizeEmail(email);
    authRateLimiterStore.delete(key);
  }

  /**
   * Get current status for an email without modifying state
   * 
   * @param email - User email address
   * @returns Current rate limit status
   */
  getStatus(email: string): AuthRateLimitResult {
    return this.checkLoginAttempt(email);
  }

  /**
   * Manually unlock an account (for admin use)
   * 
   * @param email - User email address
   */
  unlockAccount(email: string): void {
    this.resetFailedAttempts(email);
  }
}

/**
 * Default authentication rate limiter instance
 * 5 failed attempts trigger 15-minute lockout
 */
export const authRateLimiter = new AuthRateLimiter({
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
});

/**
 * Helper function to format lockout time remaining
 * 
 * @param seconds - Seconds remaining
 * @returns Formatted string (e.g., "14 minutes 30 seconds")
 */
export function formatLockoutTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
}
