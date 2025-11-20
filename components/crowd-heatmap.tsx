/**
 * CrowdHeatmap Component
 * 
 * Main container component that orchestrates the heatmap visualization.
 * Integrates data fetching, state management, and responsive grid layout.
 * 
 * Features:
 * - Real-time data polling via useHeatmapData hook
 * - Responsive grid layout (2 columns mobile, 3 columns tablet/desktop)
 * - Loading indicator with pulse animation
 * - Zone selection and modal interaction
 * - Error handling and retry logic
 */

'use client'

import * as React from 'react';
import { useHeatmapData } from '@/hooks/use-heatmap-data';
import { HeatmapZone } from '@/components/heatmap-zone';
import { ZoneDetailModal } from '@/components/zone-detail-modal';
import type { CrowdHeatmapProps, ZoneData } from '@/lib/types/crowd-heatmap';

/**
 * CrowdHeatmap Component
 * 
 * Displays a grid of zones with real-time crowd density visualization.
 * Manages state for zones, loading, last update, and selected zone.
 */
export function CrowdHeatmap({
  refreshInterval = 3000,
  maxCapacity = 500,
  className = ''
}: CrowdHeatmapProps) {
  // Fetch data using custom hook
  const { zones, isLoading, error, lastUpdate, refetch } = useHeatmapData(refreshInterval);
  
  // State for selected zone (for modal display)
  const [selectedZone, setSelectedZone] = React.useState<ZoneData | null>(null);
  
  /**
   * Handle zone click/tap interaction
   * Sets the selected zone for modal display
   */
  const handleZoneClick = React.useCallback((zone: ZoneData) => {
    setSelectedZone(zone);
  }, []);
  
  /**
   * Handle modal close
   * Clears the selected zone
   */
  const handleModalClose = React.useCallback(() => {
    setSelectedZone(null);
  }, []);
  
  /**
   * Sort zones by position for consistent grid layout
   * Ensures zones render in correct order (row by row, left to right)
   */
  const sortedZones = React.useMemo(() => {
    return [...zones].sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });
  }, [zones]);
  
  return (
    <div className={`w-full ${className}`} role="region" aria-label="Real-time crowd heatmap">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          Crowd Heatmap
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Real-time crowd density across temple zones
        </p>
        
        {/* Last Update Timestamp */}
        {lastUpdate && (
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>
      
      {/* Loading Indicator */}
      {isLoading && zones.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading crowd data...
            </p>
          </div>
        </div>
      )}
      
      {/* Error Display - No Data Available */}
      {error && zones.length === 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-red-600 dark:text-red-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-red-800 dark:text-red-300 mb-2">
                Connection Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-1">
                {error.message}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500 mb-4">
                Unable to load crowd data. Please check your connection and try again.
              </p>
              <button
                onClick={refetch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Heatmap Grid */}
      {zones.length > 0 && (
        <div className="relative">
          {/* Pulse animation overlay during refresh */}
          {isLoading && (
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Updating...
                </span>
              </div>
            </div>
          )}
          
          {/* Responsive Grid Layout
              - Mobile (< 768px): 2 columns
              - Tablet/Desktop (>= 768px): 3 columns
          */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {sortedZones.map((zone) => (
              <HeatmapZone
                key={zone.id}
                zone={zone}
                maxCapacity={maxCapacity}
                onClick={handleZoneClick}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Connection Lost Indicator (when error but have previous data) */}
      {error && zones.length > 0 && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-800 dark:text-yellow-300">
              Connection lost. Showing previous data. Retrying...
            </span>
          </div>
        </div>
      )}
      
      {/* Zone Detail Modal */}
      <ZoneDetailModal
        zone={selectedZone}
        isOpen={selectedZone !== null}
        onClose={handleModalClose}
      />
    </div>
  );
}
