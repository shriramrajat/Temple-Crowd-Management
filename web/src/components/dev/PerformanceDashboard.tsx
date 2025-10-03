'use client';

import { useState, useEffect } from 'react';
import { memoryCache } from '../../lib/cache';

interface PerformanceMetrics {
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
  cacheSize: number;
  loadTime: number;
}

/**
 * Development-only performance monitoring dashboard
 */
export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    cacheSize: 0,
    loadTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMetrics = () => {
      const newMetrics: PerformanceMetrics = {
        cacheSize: memoryCache.size(),
        loadTime: performance.now(),
      };

      // Get memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        newMetrics.memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        };
      }

      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Toggle Performance Dashboard"
      >
        📊
      </button>

      {/* Dashboard */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Size:</span>
              <span className="font-mono">{metrics.cacheSize} items</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Load Time:</span>
              <span className="font-mono">{Math.round(metrics.loadTime)}ms</span>
            </div>

            {metrics.memoryUsage && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Used:</span>
                  <span className="font-mono">{metrics.memoryUsage.used}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Total:</span>
                  <span className="font-mono">{metrics.memoryUsage.total}MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory Limit:</span>
                  <span className="font-mono">{metrics.memoryUsage.limit}MB</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                memoryCache.clear();
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-colors"
            >
              Clear Cache & Reload
            </button>
          </div>
        </div>
      )}
    </>
  );
};