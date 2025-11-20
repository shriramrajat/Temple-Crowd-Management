/**
 * Rate Limiting Utilities
 * 
 * Provides client-side rate limiting for SOS alerts to prevent spam.
 * Stores last alert timestamp in localStorage and enforces cooldown periods.
 * 
 * Requirements: 1.1
 */

const RATE_LIMIT_KEY = 'sos_rate_limit';
const COOLDOWN_PERIOD_MS = 60 * 1000; // 1 minute

/**
 * Rate limit data structure
 */
interface RateLimitData {
  lastAlertTimestamp: number;
  alertCount: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remainingTime: number; // milliseconds until next alert is allowed
  lastAlertTime: number | null; // timestamp of last alert
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get rate limit data from localStorage
 */
function getRateLimitData(): RateLimitData | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    
    if (!data) {
      return null;
    }

    return JSON.parse(data) as RateLimitData;
  } catch (error) {
    console.error('Error reading rate limit data:', error);
    return null;
  }
}

/**
 * Save rate limit data to localStorage
 */
function saveRateLimitData(data: RateLimitData): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving rate limit data:', error);
  }
}

/**
 * Check if user can send an SOS alert
 * Returns whether the alert is allowed and remaining cooldown time
 * 
 * Requirements: 1.1 - Max 1 SOS per minute per user
 */
export function checkRateLimit(): RateLimitResult {
  const data = getRateLimitData();
  
  if (!data) {
    // No previous alerts, allow
    return {
      allowed: true,
      remainingTime: 0,
      lastAlertTime: null
    };
  }

  const now = Date.now();
  const timeSinceLastAlert = now - data.lastAlertTimestamp;
  
  if (timeSinceLastAlert >= COOLDOWN_PERIOD_MS) {
    // Cooldown period has passed, allow
    return {
      allowed: true,
      remainingTime: 0,
      lastAlertTime: data.lastAlertTimestamp
    };
  }

  // Still in cooldown period
  const remainingTime = COOLDOWN_PERIOD_MS - timeSinceLastAlert;
  
  return {
    allowed: false,
    remainingTime,
    lastAlertTime: data.lastAlertTimestamp
  };
}

/**
 * Record that an SOS alert was sent
 * Updates the last alert timestamp in localStorage
 * 
 * Requirements: 1.1 - Store last alert timestamp
 */
export function recordAlertSent(): void {
  const now = Date.now();
  const data = getRateLimitData();
  
  const newData: RateLimitData = {
    lastAlertTimestamp: now,
    alertCount: (data?.alertCount || 0) + 1
  };
  
  saveRateLimitData(newData);
}

/**
 * Get remaining cooldown time in milliseconds
 * Returns 0 if no cooldown is active
 */
export function getRemainingCooldown(): number {
  const result = checkRateLimit();
  return result.remainingTime;
}

/**
 * Format remaining time as human-readable string
 * Example: "45 seconds", "1 minute"
 */
export function formatRemainingTime(milliseconds: number): string {
  if (milliseconds <= 0) {
    return '0 seconds';
  }

  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Clear rate limit data (useful for testing)
 */
export function clearRateLimit(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch (error) {
    console.error('Error clearing rate limit data:', error);
  }
}

/**
 * Get total number of alerts sent (for analytics)
 */
export function getTotalAlertCount(): number {
  const data = getRateLimitData();
  return data?.alertCount || 0;
}
