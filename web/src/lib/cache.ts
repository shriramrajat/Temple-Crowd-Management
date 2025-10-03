/**
 * Caching strategies for improved performance
 */

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Memory cache for frequently accessed data
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }
}

// Global memory cache instance
export const memoryCache = new MemoryCache();

// Local storage cache with expiration
export const localStorageCache = {
  set(key: string, data: any, ttl: number = 24 * 60 * 60 * 1000) { // 24 hours default
    if (typeof window === 'undefined') return;
    
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
    }
  },

  get(key: string): any | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      const isExpired = Date.now() - item.timestamp > item.ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error);
      return null;
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },

  delete(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Cache keys constants
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  AUTH_STATE: 'auth_state',
  FIRESTORE_DATA: 'firestore_data',
  APP_CONFIG: 'app_config',
} as const;

// Cache invalidation helper
export const invalidateCache = (pattern?: string) => {
  memoryCache.clear();
  
  if (typeof window !== 'undefined') {
    if (pattern) {
      // Clear specific pattern from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear all cache
      localStorage.clear();
    }
  }
};

// Preload and cache critical data
export const preloadCriticalData = async () => {
  // This can be used to preload user data, app configuration, etc.
  // Implementation depends on specific app requirements
  console.log('Preloading critical data...');
};