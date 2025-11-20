/**
 * Throttle utility for performance optimization
 * 
 * Limits the rate at which a function can be called.
 * Useful for throttling real-time updates to prevent excessive re-renders.
 */

/**
 * Throttle a function to execute at most once per specified interval
 * 
 * @param func - The function to throttle
 * @param limit - The minimum time (in ms) between function executions
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      // Execute immediately if not in throttle period
      func(...args);
      inThrottle = true;

      // Reset throttle after limit period
      setTimeout(() => {
        inThrottle = false;
        
        // Execute with last args if there were calls during throttle period
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      }, limit);
    } else {
      // Store last args to execute after throttle period
      lastArgs = args;
    }
  };
}

/**
 * Batch multiple state updates together using requestAnimationFrame
 * 
 * @param callback - The callback to execute in the next animation frame
 * @returns Cleanup function to cancel the scheduled callback
 */
export function batchUpdates(callback: () => void): () => void {
  const rafId = requestAnimationFrame(callback);
  
  return () => {
    cancelAnimationFrame(rafId);
  };
}

/**
 * Debounce a function to execute only after it stops being called for a specified delay
 * 
 * @param func - The function to debounce
 * @param delay - The delay (in ms) to wait before executing
 * @returns Debounced function with cancel method
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = function(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
