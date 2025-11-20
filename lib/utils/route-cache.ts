/**
 * Route Calculation Cache
 * 
 * Implements caching for route calculations to improve performance
 */

import type { OptimizedRoute, Coordinates } from '@/lib/types/route-optimization';
import type { AccessibilityProfile } from '@/lib/types/accessibility';

/**
 * Cache entry
 */
interface CacheEntry {
  route: OptimizedRoute;
  timestamp: Date;
  accessCount: number;
}

/**
 * Cache key generator
 */
function generateCacheKey(
  startPoint: Coordinates,
  endPoint: Coordinates,
  profile?: AccessibilityProfile
): string {
  const start = `${startPoint.latitude.toFixed(4)},${startPoint.longitude.toFixed(4)}`;
  const end = `${endPoint.latitude.toFixed(4)},${endPoint.longitude.toFixed(4)}`;
  const categories = profile?.categories.sort().join(',') || 'none';
  const mobility = profile?.mobilitySpeed || 'normal';
  
  return `${start}|${end}|${categories}|${mobility}`;
}

/**
 * Route cache with LRU eviction
 */
class RouteCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttlMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get cached route
   */
  get(
    startPoint: Coordinates,
    endPoint: Coordinates,
    profile?: AccessibilityProfile
  ): OptimizedRoute | null {
    const key = generateCacheKey(startPoint, endPoint, profile);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const age = Date.now() - entry.timestamp.getTime();
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access count for LRU
    entry.accessCount++;
    
    return entry.route;
  }

  /**
   * Set cached route
   */
  set(
    startPoint: Coordinates,
    endPoint: Coordinates,
    profile: AccessibilityProfile | undefined,
    route: OptimizedRoute
  ): void {
    const key = generateCacheKey(startPoint, endPoint, profile);

    // Evict least recently used if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      route,
      timestamp: new Date(),
      accessCount: 1,
    });
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    const totalAccess = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalAccess / this.cache.size : 0,
    };
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp.getTime();
      if (age > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
const routeCache = new RouteCache();

// Cleanup expired entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    routeCache.cleanup();
  }, 10 * 60 * 1000);
}

export default routeCache;
