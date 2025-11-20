/**
 * Performance Monitoring React Hook
 * 
 * Task 17.1: Profile DensityMonitor to identify bottlenecks
 * 
 * Provides React hooks for monitoring and optimizing component performance.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getPerformanceOptimizer } from './performance-optimizer';

/**
 * Hook to measure component render time
 * 
 * Task 17.1: Optimize React re-renders
 * 
 * @param componentName - Name of the component for logging
 * @returns Render count and average render time
 */
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const startTime = useRef<number>(0);
  
  // Record render start time
  startTime.current = performance.now();
  
  useEffect(() => {
    // Record render end time
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    renderCount.current++;
    renderTimes.current.push(renderTime);
    
    // Keep only last 50 render times
    if (renderTimes.current.length > 50) {
      renderTimes.current.shift();
    }
    
    // Record in performance optimizer
    const optimizer = getPerformanceOptimizer();
    optimizer.recordRenderTime(renderTime);
    
    // Log slow renders (> 16ms = below 60fps)
    if (renderTime > 16) {
      console.warn(`[Performance] Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });
  
  const getAverageRenderTime = useCallback(() => {
    if (renderTimes.current.length === 0) return 0;
    const sum = renderTimes.current.reduce((acc: number, time: number) => acc + time, 0);
    return sum / renderTimes.current.length;
  }, []);
  
  return {
    renderCount: renderCount.current,
    averageRenderTime: getAverageRenderTime(),
  };
}

/**
 * Hook to monitor performance metrics
 * 
 * @param updateInterval - How often to update metrics (ms)
 * @returns Current performance metrics
 */
export function usePerformanceMetrics(updateInterval: number = 5000) {
  const [metrics, setMetrics] = useState(() => {
    const optimizer = getPerformanceOptimizer();
    return optimizer.getPerformanceReport();
  });
  
  useEffect(() => {
    const optimizer = getPerformanceOptimizer();
    
    const interval = setInterval(() => {
      setMetrics(optimizer.getPerformanceReport());
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [updateInterval]);
  
  return metrics;
}

/**
 * Hook to detect performance degradation
 * 
 * @returns Whether performance is degraded and metrics
 */
export function usePerformanceDegradation() {
  const metrics = usePerformanceMetrics(3000);
  
  return {
    isDegraded: metrics.isDegraded,
    metrics,
  };
}

/**
 * Hook to optimize expensive computations with memoization
 * 
 * Task 17.1: Optimize React re-renders with useMemo for computed values
 * 
 * This is a wrapper around useMemo that also tracks cache hits/misses
 * 
 * @param factory - Factory function to compute value
 * @param deps - Dependencies array
 * @returns Memoized value
 */
export function useOptimizedMemo<T>(
  factory: () => T,
  deps: any[]
): T {
  const previousDeps = useRef<any[]>();
  const previousValue = useRef<T>();
  const optimizer = getPerformanceOptimizer();
  
  // Check if dependencies changed
  const depsChanged = !previousDeps.current || 
    deps.length !== previousDeps.current.length ||
    deps.some((dep: any, i: number) => !Object.is(dep, previousDeps.current![i]));
  
  if (depsChanged) {
    // Cache miss - recompute
    optimizer.recordCacheMiss();
    previousValue.current = factory();
    previousDeps.current = deps;
  } else {
    // Cache hit - return cached value
    optimizer.recordCacheHit();
  }
  
  return previousValue.current!;
}

/**
 * Hook to optimize callback functions
 * 
 * Task 17.1: Optimize React re-renders with useCallback for event handlers
 * 
 * This is a wrapper around useCallback that also tracks performance
 * 
 * @param callback - Callback function
 * @param deps - Dependencies array
 * @returns Memoized callback
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  const previousDeps = useRef<any[]>();
  const previousCallback = useRef<T>();
  const optimizer = getPerformanceOptimizer();
  
  // Check if dependencies changed
  const depsChanged = !previousDeps.current || 
    deps.length !== previousDeps.current.length ||
    deps.some((dep: any, i: number) => !Object.is(dep, previousDeps.current![i]));
  
  if (depsChanged) {
    // Cache miss - create new callback
    optimizer.recordCacheMiss();
    previousCallback.current = callback;
    previousDeps.current = deps;
  } else {
    // Cache hit - return cached callback
    optimizer.recordCacheHit();
  }
  
  return previousCallback.current!;
}

/**
 * Hook to debounce a value
 * 
 * Task 17.1: Add debouncing for high-frequency density updates
 * 
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook to throttle a callback
 * 
 * @param callback - Callback to throttle
 * @param limit - Minimum time between executions (ms)
 * @returns Throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false);
  const lastResult = useRef<ReturnType<T>>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (!inThrottle.current) {
        lastResult.current = callback(...args);
        inThrottle.current = true;
        
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
      
      return lastResult.current;
    }) as T,
    [callback, limit]
  );
}

/**
 * Hook to track component mount/unmount for memory leak detection
 * 
 * @param componentName - Name of the component
 */
export function useComponentLifecycle(componentName: string) {
  useEffect(() => {
    console.debug(`[Lifecycle] ${componentName} mounted`);
    
    return () => {
      console.debug(`[Lifecycle] ${componentName} unmounted`);
    };
  }, [componentName]);
}

/**
 * Hook to measure async operation performance
 * 
 * @returns Function to measure async operations
 */
export function useAsyncPerformance() {
  const optimizer = getPerformanceOptimizer();
  
  const measureAsync = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      operationType: 'density' | 'evaluation'
    ): Promise<T> => {
      const startTime = performance.now();
      
      try {
        const result = await operation();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (operationType === 'density') {
          optimizer.recordDensityProcessing(duration);
        } else {
          optimizer.recordEvaluationProcessing(duration);
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.error(`[Performance] ${operationType} operation failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    },
    [optimizer]
  );
  
  return { measureAsync };
}
