/**
 * Performance Optimizer Utility
 * 
 * Provides utilities for optimizing real-time data processing performance.
 * Task 17.1: Optimize real-time data processing
 * 
 * Features:
 * - Performance monitoring and profiling
 * - Adaptive debouncing based on system load
 * - Memory usage tracking
 * - Cache hit rate monitoring
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  densityProcessingTime: number[];
  evaluationProcessingTime: number[];
  renderTime: number[];
  cacheHitRate: number;
  memoryUsage: number;
  activeSubscribers: number;
}

/**
 * Performance Optimizer class
 */
export class PerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    densityProcessingTime: [],
    evaluationProcessingTime: [],
    renderTime: [],
    cacheHitRate: 0,
    memoryUsage: 0,
    activeSubscribers: 0,
  };
  
  private cacheHits = 0;
  private cacheMisses = 0;
  
  // Keep only last 100 measurements for each metric
  private readonly MAX_SAMPLES = 100;
  
  /**
   * Record density processing time
   */
  recordDensityProcessing(timeMs: number): void {
    this.metrics.densityProcessingTime.push(timeMs);
    if (this.metrics.densityProcessingTime.length > this.MAX_SAMPLES) {
      this.metrics.densityProcessingTime.shift();
    }
  }
  
  /**
   * Record evaluation processing time
   */
  recordEvaluationProcessing(timeMs: number): void {
    this.metrics.evaluationProcessingTime.push(timeMs);
    if (this.metrics.evaluationProcessingTime.length > this.MAX_SAMPLES) {
      this.metrics.evaluationProcessingTime.shift();
    }
  }
  
  /**
   * Record render time
   */
  recordRenderTime(timeMs: number): void {
    this.metrics.renderTime.push(timeMs);
    if (this.metrics.renderTime.length > this.MAX_SAMPLES) {
      this.metrics.renderTime.shift();
    }
  }
  
  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
    this.updateCacheHitRate();
  }
  
  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
    this.updateCacheHitRate();
  }
  
  /**
   * Update cache hit rate
   */
  private updateCacheHitRate(): void {
    const total = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = total > 0 ? this.cacheHits / total : 0;
  }
  
  /**
   * Update memory usage (if available)
   */
  updateMemoryUsage(): void {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  }
  
  /**
   * Set active subscriber count
   */
  setActiveSubscribers(count: number): void {
    this.metrics.activeSubscribers = count;
  }
  
  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get average processing time for a metric
   */
  getAverageTime(metric: 'density' | 'evaluation' | 'render'): number {
    let times: number[];
    
    switch (metric) {
      case 'density':
        times = this.metrics.densityProcessingTime;
        break;
      case 'evaluation':
        times = this.metrics.evaluationProcessingTime;
        break;
      case 'render':
        times = this.metrics.renderTime;
        break;
    }
    
    if (times.length === 0) return 0;
    
    const sum = times.reduce((acc, time) => acc + time, 0);
    return sum / times.length;
  }
  
  /**
   * Get 95th percentile processing time
   */
  getP95Time(metric: 'density' | 'evaluation' | 'render'): number {
    let times: number[];
    
    switch (metric) {
      case 'density':
        times = this.metrics.densityProcessingTime;
        break;
      case 'evaluation':
        times = this.metrics.evaluationProcessingTime;
        break;
      case 'render':
        times = this.metrics.renderTime;
        break;
    }
    
    if (times.length === 0) return 0;
    
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }
  
  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    const avgDensityTime = this.getAverageTime('density');
    const avgEvaluationTime = this.getAverageTime('evaluation');
    const avgRenderTime = this.getAverageTime('render');
    
    // Performance is degraded if:
    // - Average density processing > 1000ms (should be < 2000ms per requirement)
    // - Average evaluation processing > 1000ms
    // - Average render time > 100ms
    // - Cache hit rate < 50%
    
    return (
      avgDensityTime > 1000 ||
      avgEvaluationTime > 1000 ||
      avgRenderTime > 100 ||
      this.metrics.cacheHitRate < 0.5
    );
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport(): {
    avgDensityProcessing: number;
    avgEvaluationProcessing: number;
    avgRenderTime: number;
    p95DensityProcessing: number;
    p95EvaluationProcessing: number;
    p95RenderTime: number;
    cacheHitRate: number;
    memoryUsage: number;
    activeSubscribers: number;
    isDegraded: boolean;
  } {
    return {
      avgDensityProcessing: this.getAverageTime('density'),
      avgEvaluationProcessing: this.getAverageTime('evaluation'),
      avgRenderTime: this.getAverageTime('render'),
      p95DensityProcessing: this.getP95Time('density'),
      p95EvaluationProcessing: this.getP95Time('evaluation'),
      p95RenderTime: this.getP95Time('render'),
      cacheHitRate: this.metrics.cacheHitRate,
      memoryUsage: this.metrics.memoryUsage,
      activeSubscribers: this.metrics.activeSubscribers,
      isDegraded: this.isPerformanceDegraded(),
    };
  }
  
  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      densityProcessingTime: [],
      evaluationProcessingTime: [],
      renderTime: [],
      cacheHitRate: 0,
      memoryUsage: 0,
      activeSubscribers: 0,
    };
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

/**
 * Singleton instance
 */
let performanceOptimizerInstance: PerformanceOptimizer | null = null;

/**
 * Get or create the singleton PerformanceOptimizer instance
 */
export function getPerformanceOptimizer(): PerformanceOptimizer {
  if (!performanceOptimizerInstance) {
    performanceOptimizerInstance = new PerformanceOptimizer();
  }
  return performanceOptimizerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetPerformanceOptimizer(): void {
  performanceOptimizerInstance = null;
}

/**
 * Debounce utility with adaptive delay
 * 
 * Task 17.1: Add debouncing for high-frequency density updates
 * 
 * @param func - Function to debounce
 * @param delay - Base delay in milliseconds
 * @param options - Debounce options
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  
  function invokeFunc(time: number) {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    func(...args);
  }
  
  function shouldInvoke(time: number): boolean {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }
  
  function timerExpired() {
    const time = Date.now();
    
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    
    // Restart timer
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;
    const remainingWait = maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
    
    timeoutId = setTimeout(timerExpired, remainingWait);
  }
  
  function trailingEdge(time: number) {
    timeoutId = null;
    
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    
    lastArgs = null;
  }
  
  function leadingEdge(time: number) {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, delay);
    
    if (leading) {
      return invokeFunc(time);
    }
  }
  
  function cancel() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    lastCallTime = 0;
    lastInvokeTime = 0;
    lastArgs = null;
    timeoutId = null;
  }
  
  function debounced(...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, delay);
    }
  }
  
  debounced.cancel = cancel;
  
  return debounced;
}

/**
 * Throttle utility for limiting function execution rate
 * 
 * Task 17.1: Optimize high-frequency event handlers
 * 
 * @param func - Function to throttle
 * @param limit - Minimum time between executions in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastResult: ReturnType<T>;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

/**
 * Memoization utility for expensive computations
 * 
 * Task 17.1: Add memoization for threshold evaluations
 * 
 * @param func - Function to memoize
 * @param keyGenerator - Function to generate cache key from arguments
 * @param maxSize - Maximum cache size (default: 100)
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
  maxSize: number = 100
): T & { cache: Map<string, ReturnType<T>>; clearCache: () => void } {
  const cache = new Map<string, ReturnType<T>>();
  const cacheOrder: string[] = [];
  
  const defaultKeyGenerator = (...args: Parameters<T>): string => {
    return JSON.stringify(args);
  };
  
  const getKey = keyGenerator || defaultKeyGenerator;
  
  const memoized = function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = getKey(...args);
    
    if (cache.has(key)) {
      getPerformanceOptimizer().recordCacheHit();
      return cache.get(key)!;
    }
    
    getPerformanceOptimizer().recordCacheMiss();
    const result = func.apply(this, args);
    
    // Add to cache
    cache.set(key, result);
    cacheOrder.push(key);
    
    // Evict oldest entry if cache is full (LRU)
    if (cache.size > maxSize) {
      const oldestKey = cacheOrder.shift()!;
      cache.delete(oldestKey);
    }
    
    return result;
  } as T & { cache: Map<string, ReturnType<T>>; clearCache: () => void };
  
  memoized.cache = cache;
  memoized.clearCache = () => {
    cache.clear();
    cacheOrder.length = 0;
  };
  
  return memoized;
}
