'use client';

import { useEffect } from 'react';
import { 
  trackWebVitals, 
  preloadCriticalResources, 
  logBundleInfo,
  monitorMemoryUsage 
} from '../../lib/performance';
import { registerServiceWorker, preloadCriticalData } from '../../lib/cache';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

/**
 * Performance Provider that initializes performance monitoring and optimizations
 */
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize performance monitoring
    trackWebVitals();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Register service worker for caching
    registerServiceWorker();
    
    // Preload critical data
    preloadCriticalData();
    
    // Development-only features
    if (process.env.NODE_ENV === 'development') {
      logBundleInfo();
      
      // Monitor memory usage every 30 seconds in development
      const memoryInterval = setInterval(monitorMemoryUsage, 30000);
      
      return () => {
        clearInterval(memoryInterval);
      };
    }
  }, []);

  return <>{children}</>;
};