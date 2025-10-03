/**
 * Performance monitoring and optimization utilities
 */

// Web Vitals tracking
export const trackWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    // Track Core Web Vitals
    import('web-vitals').then((webVitals) => {
      if (webVitals.onCLS) webVitals.onCLS(console.log);
      if (webVitals.onFID) webVitals.onFID(console.log);
      if (webVitals.onFCP) webVitals.onFCP(console.log);
      if (webVitals.onLCP) webVitals.onLCP(console.log);
      if (webVitals.onTTFB) webVitals.onTTFB(console.log);
    }).catch(() => {
      // Silently fail if web-vitals is not available
    });
  }
};

// Lazy load components with loading states
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallbackComponent?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const fallbackElement = fallbackComponent 
      ? React.createElement(fallbackComponent) 
      : React.createElement('div', { children: 'Loading...' });
      
    return React.createElement(
      React.Suspense,
      { fallback: fallbackElement },
      React.createElement(LazyComponent, props)
    );
  };
}

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload Firebase auth when user is likely to need it
    const preloadAuth = () => {
      import('../services/firebase/dynamicImports').then(({ getAuthService }) => {
        getAuthService();
      });
    };

    // Preload on user interaction
    const events = ['mousedown', 'touchstart', 'keydown'];
    const preloadOnce = () => {
      preloadAuth();
      events.forEach(event => {
        document.removeEventListener(event, preloadOnce);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, preloadOnce, { once: true, passive: true });
    });

    // Fallback: preload after 3 seconds
    setTimeout(preloadAuth, 3000);
  }
};

// Image optimization helper
export const getOptimizedImageProps = (
  src: string,
  alt: string,
  width?: number,
  height?: number
) => ({
  src,
  alt,
  width,
  height,
  loading: 'lazy' as const,
  decoding: 'async' as const,
  style: {
    maxWidth: '100%',
    height: 'auto',
  },
});

// Bundle size analyzer helper
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available at: npm run analyze');
  }
};

// Memory usage monitoring (development only)
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'performance' in window && 'memory' in (window.performance as any)) {
    const memory = (window.performance as any).memory;
    console.log('Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB',
    });
  }
};

// React import for lazy components
import React from 'react';