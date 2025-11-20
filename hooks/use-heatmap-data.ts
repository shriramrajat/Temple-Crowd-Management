/**
 * useHeatmapData Hook
 * 
 * Custom hook for fetching and polling crowd data from the IoT Simulator API.
 * Implements automatic refresh, error handling, and cleanup logic.
 * 
 * @param refreshInterval - Polling interval in milliseconds (default: 3000)
 * @returns Hook state with zones, loading, error, lastUpdate, and refetch function
 */

'use client'

import * as React from 'react';
import type { ZoneData, CrowdDataResponse, UseHeatmapDataReturn } from '@/lib/types/crowd-heatmap';

/**
 * Custom hook for polling crowd data with automatic refresh
 * 
 * Features:
 * - Automatic polling at configurable intervals
 * - Error handling with 5-second retry on failure
 * - Cleanup logic to cancel pending requests on unmount
 * - Manual refetch function for user-triggered updates
 * - Loading and error state management
 */
export function useHeatmapData(refreshInterval: number = 3000): UseHeatmapDataReturn {
  // State management
  const [zones, setZones] = React.useState<ZoneData[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  
  // Refs for cleanup and abort control
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const pollingIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const consecutiveFailuresRef = React.useRef<number>(0);
  
  /**
   * Fetch crowd data from the API
   * Implements abort signal for cleanup and error handling
   */
  const fetchCrowdData = React.useCallback(async () => {
    try {
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('/api/crowd-data', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch crowd data: ${response.status} ${response.statusText}`);
      }
      
      const data: CrowdDataResponse = await response.json();
      
      // Update state with successful response
      setZones(data.zones);
      setLastUpdate(new Date(data.timestamp));
      setError(null);
      setIsLoading(false);
      
      // Reset consecutive failures counter on success
      consecutiveFailuresRef.current = 0;
      
    } catch (err) {
      // Ignore abort errors (these are intentional)
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      // Increment consecutive failures counter
      consecutiveFailuresRef.current += 1;
      
      // Handle other errors
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      setIsLoading(false);
      
      console.error('Error fetching crowd data:', errorObj);
      console.error(`Consecutive failures: ${consecutiveFailuresRef.current}`);
      
      // Only retry if we haven't exceeded 3 consecutive failures
      if (consecutiveFailuresRef.current < 3) {
        // Retry after 5 seconds on failure
        retryTimeoutRef.current = setTimeout(() => {
          fetchCrowdData();
        }, 5000);
      } else {
        console.error('Maximum retry attempts (3) reached. Stopping automatic retries.');
      }
    }
  }, []);
  
  /**
   * Manual refetch function for user-triggered updates
   * Clears any pending retry and fetches immediately
   * Resets consecutive failures counter
   */
  const refetch = React.useCallback(async () => {
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Reset consecutive failures counter on manual refetch
    consecutiveFailuresRef.current = 0;
    
    setIsLoading(true);
    await fetchCrowdData();
  }, [fetchCrowdData]);
  
  /**
   * Set up polling mechanism with cleanup
   */
  React.useEffect(() => {
    // Initial fetch
    fetchCrowdData();
    
    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchCrowdData();
    }, refreshInterval);
    
    // Cleanup function
    return () => {
      // Cancel pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      
      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [refreshInterval, fetchCrowdData]);
  
  return {
    zones,
    isLoading,
    error,
    lastUpdate,
    refetch,
  };
}
