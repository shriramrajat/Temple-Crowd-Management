/**
 * Notification Cache Service
 * 
 * Provides caching for frequently accessed data to optimize notification delivery.
 * Task 17.2: Add caching for frequently accessed data (area configs, admin preferences)
 */

import {
  ThresholdConfig,
  AdminNotificationConfig,
  MonitoredArea,
} from './types';

/**
 * Cache entry with TTL
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Cache statistics
 */
interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * NotificationCache class
 * 
 * Provides in-memory caching with TTL for frequently accessed data
 */
export class NotificationCache {
  private areaConfigCache: Map<string, CacheEntry<ThresholdConfig>> = new Map();
  private adminPrefsCache: Map<string, CacheEntry<AdminNotificationConfig>> = new Map();
  private areaDataCache: Map<string, CacheEntry<MonitoredArea>> = new Map();
  
  // Cache statistics
  private stats = {
    areaConfig: { hits: 0, misses: 0 },
    adminPrefs: { hits: 0, misses: 0 },
    areaData: { hits: 0, misses: 0 },
  };
  
  // Default TTL: 5 minutes
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000;
  
  // Cleanup interval: 1 minute
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 60 * 1000;

  constructor() {
    this.startCleanupTimer();
  }

  /**
   * Get area configuration from cache
   */
  getAreaConfig(areaId: string): ThresholdConfig | null {
    const entry = this.areaConfigCache.get(areaId);
    
    if (!entry) {
      this.stats.areaConfig.misses++;
      return null;
    }
    
    if (this.isExpired(entry)) {
      this.areaConfigCache.delete(areaId);
      this.stats.areaConfig.misses++;
      return null;
    }
    
    this.stats.areaConfig.hits++;
    return entry.data;
  }

  /**
   * Set area configuration in cache
   */
  setAreaConfig(areaId: string, config: ThresholdConfig, ttl?: number): void {
    this.areaConfigCache.set(areaId, {
      data: config,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL_MS,
    });
  }

  /**
   * Get admin preferences from cache
   */
  getAdminPrefs(adminId: string): AdminNotificationConfig | null {
    const entry = this.adminPrefsCache.get(adminId);
    
    if (!entry) {
      this.stats.adminPrefs.misses++;
      return null;
    }
    
    if (this.isExpired(entry)) {
      this.adminPrefsCache.delete(adminId);
      this.stats.adminPrefs.misses++;
      return null;
    }
    
    this.stats.adminPrefs.hits++;
    return entry.data;
  }

  /**
   * Set admin preferences in cache
   */
  setAdminPrefs(adminId: string, prefs: AdminNotificationConfig, ttl?: number): void {
    this.adminPrefsCache.set(adminId, {
      data: prefs,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL_MS,
    });
  }

  /**
   * Get area data from cache
   */
  getAreaData(areaId: string): MonitoredArea | null {
    const entry = this.areaDataCache.get(areaId);
    
    if (!entry) {
      this.stats.areaData.misses++;
      return null;
    }
    
    if (this.isExpired(entry)) {
      this.areaDataCache.delete(areaId);
      this.stats.areaData.misses++;
      return null;
    }
    
    this.stats.areaData.hits++;
    return entry.data;
  }

  /**
   * Set area data in cache
   */
  setAreaData(areaId: string, area: MonitoredArea, ttl?: number): void {
    this.areaDataCache.set(areaId, {
      data: area,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL_MS,
    });
  }

  /**
   * Invalidate area configuration cache
   */
  invalidateAreaConfig(areaId: string): void {
    this.areaConfigCache.delete(areaId);
  }

  /**
   * Invalidate admin preferences cache
   */
  invalidateAdminPrefs(adminId: string): void {
    this.adminPrefsCache.delete(adminId);
  }

  /**
   * Invalidate area data cache
   */
  invalidateAreaData(areaId: string): void {
    this.areaDataCache.delete(areaId);
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.areaConfigCache.clear();
    this.adminPrefsCache.clear();
    this.areaDataCache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    areaConfig: CacheStats;
    adminPrefs: CacheStats;
    areaData: CacheStats;
    total: CacheStats;
  } {
    const areaConfigStats = this.calculateStats(
      this.stats.areaConfig,
      this.areaConfigCache.size
    );
    const adminPrefsStats = this.calculateStats(
      this.stats.adminPrefs,
      this.adminPrefsCache.size
    );
    const areaDataStats = this.calculateStats(
      this.stats.areaData,
      this.areaDataCache.size
    );
    
    const totalHits = this.stats.areaConfig.hits + this.stats.adminPrefs.hits + this.stats.areaData.hits;
    const totalMisses = this.stats.areaConfig.misses + this.stats.adminPrefs.misses + this.stats.areaData.misses;
    const totalSize = this.areaConfigCache.size + this.adminPrefsCache.size + this.areaDataCache.size;
    
    return {
      areaConfig: areaConfigStats,
      adminPrefs: adminPrefsStats,
      areaData: areaDataStats,
      total: {
        hits: totalHits,
        misses: totalMisses,
        size: totalSize,
        hitRate: totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0,
      },
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Calculate cache statistics
   */
  private calculateStats(
    stats: { hits: number; misses: number },
    size: number
  ): CacheStats {
    const total = stats.hits + stats.misses;
    return {
      hits: stats.hits,
      misses: stats.misses,
      size,
      hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
    };
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      areaConfig: { hits: 0, misses: 0 },
      adminPrefs: { hits: 0, misses: 0 },
      areaData: { hits: 0, misses: 0 },
    };
  }

  /**
   * Start cleanup timer to remove expired entries
   */
  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL_MS);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanup(): void {
    // Clean area config cache
    for (const [key, entry] of this.areaConfigCache.entries()) {
      if (this.isExpired(entry)) {
        this.areaConfigCache.delete(key);
      }
    }
    
    // Clean admin prefs cache
    for (const [key, entry] of this.adminPrefsCache.entries()) {
      if (this.isExpired(entry)) {
        this.adminPrefsCache.delete(key);
      }
    }
    
    // Clean area data cache
    for (const [key, entry] of this.areaDataCache.entries()) {
      if (this.isExpired(entry)) {
        this.areaDataCache.delete(key);
      }
    }
  }

  /**
   * Stop cleanup timer and cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearAll();
  }
}

/**
 * Singleton instance
 */
let notificationCacheInstance: NotificationCache | null = null;

/**
 * Get the singleton NotificationCache instance
 */
export function getNotificationCache(): NotificationCache {
  if (!notificationCacheInstance) {
    notificationCacheInstance = new NotificationCache();
  }
  return notificationCacheInstance;
}

/**
 * Reset the singleton instance (for testing)
 */
export function resetNotificationCache(): void {
  if (notificationCacheInstance) {
    notificationCacheInstance.destroy();
  }
  notificationCacheInstance = null;
}
