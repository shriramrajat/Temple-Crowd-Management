/**
 * ZoneDetailModal Component
 * 
 * Modal dialog that displays detailed information about a selected zone.
 * Uses Radix UI Dialog primitive for accessibility and interactions.
 * 
 * Features:
 * - Zone name, footfall count, density percentage, and last update time
 * - Trend indicator with appropriate icons (increasing/decreasing/stable)
 * - Close functionality (X button, Escape key, backdrop click)
 * - Focus trap for keyboard navigation
 * - Responsive layout (full-screen mobile, centered dialog desktop)
 * - WCAG compliant with proper ARIA attributes
 */

'use client'

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ZoneDetailModalProps } from '@/lib/types/crowd-heatmap';

/**
 * Format timestamp in human-readable format
 * 
 * @param timestamp - ISO 8601 timestamp string
 * @returns Formatted date and time string
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  
  // Format: "Nov 16, 2025 at 3:45:30 PM"
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Calculate density percentage
 * 
 * @param footfall - Current number of people
 * @param capacity - Maximum capacity
 * @returns Density as percentage (0-100)
 */
function calculateDensityPercentage(footfall: number, capacity: number): number {
  return Math.round((footfall / capacity) * 100);
}

/**
 * Get trend icon component based on trend direction
 * 
 * @param trend - Trend direction (increasing/decreasing/stable)
 * @returns Lucide icon component
 */
function getTrendIcon(trend?: 'increasing' | 'decreasing' | 'stable') {
  switch (trend) {
    case 'increasing':
      return TrendingUp;
    case 'decreasing':
      return TrendingDown;
    case 'stable':
    default:
      return Minus;
  }
}

/**
 * Get trend label for display
 * 
 * @param trend - Trend direction
 * @returns Human-readable trend label
 */
function getTrendLabel(trend?: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing':
      return 'Increasing';
    case 'decreasing':
      return 'Decreasing';
    case 'stable':
    default:
      return 'Stable';
  }
}

/**
 * Get trend color class based on direction
 * 
 * @param trend - Trend direction
 * @returns Tailwind CSS color class
 */
function getTrendColor(trend?: 'increasing' | 'decreasing' | 'stable'): string {
  switch (trend) {
    case 'increasing':
      return 'text-red-600 dark:text-red-400';
    case 'decreasing':
      return 'text-green-600 dark:text-green-400';
    case 'stable':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

/**
 * ZoneDetailModal Component
 * 
 * Displays detailed zone information in an accessible modal dialog.
 * Implements Radix UI Dialog with full keyboard and screen reader support.
 */
export function ZoneDetailModal({ zone, isOpen, onClose }: ZoneDetailModalProps) {
  // Don't render if no zone is selected
  if (!zone) {
    return null;
  }
  
  const densityPercentage = calculateDensityPercentage(zone.footfall, zone.capacity);
  const formattedTimestamp = formatTimestamp(zone.lastUpdated);
  const TrendIcon = getTrendIcon(zone.trend);
  const trendLabel = getTrendLabel(zone.trend);
  const trendColor = getTrendColor(zone.trend);
  
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop with click-to-close */}
        <Dialog.Overlay 
          className="
            fixed 
            inset-0 
            bg-black/50 
            backdrop-blur-sm
            data-[state=open]:animate-in 
            data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 
            data-[state=open]:fade-in-0
            z-50
          "
        />
        
        {/* Modal Content */}
        <Dialog.Content
          className="
            fixed
            left-[50%]
            top-[50%]
            translate-x-[-50%]
            translate-y-[-50%]
            w-[calc(100%-2rem)]
            max-w-md
            max-h-[85vh]
            bg-white
            dark:bg-gray-900
            rounded-lg
            shadow-xl
            p-6
            focus:outline-none
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            data-[state=closed]:slide-out-to-left-1/2
            data-[state=closed]:slide-out-to-top-[48%]
            data-[state=open]:slide-in-from-left-1/2
            data-[state=open]:slide-in-from-top-[48%]
            z-50
            md:w-full
          "
          aria-describedby="zone-detail-description"
        >
          {/* Header with Close Button */}
          <div className="flex items-start justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {zone.name}
            </Dialog.Title>
            
            <Dialog.Close
              className="
                rounded-full
                p-1.5
                text-gray-400
                hover:text-gray-600
                hover:bg-gray-100
                dark:hover:text-gray-200
                dark:hover:bg-gray-800
                transition-colors
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
              "
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>
          
          {/* Zone Details */}
          <Dialog.Description
            id="zone-detail-description"
            className="space-y-6"
            asChild
          >
            <div>
            {/* Footfall Count */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Footfall
              </div>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {zone.footfall.toLocaleString('en-US')}
                <span className="text-lg font-normal text-gray-500 dark:text-gray-400 ml-2">
                  people
                </span>
              </div>
            </div>
            
            {/* Density Percentage */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Density Level
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {densityPercentage}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  of {zone.capacity} capacity
                </div>
              </div>
              
              {/* Visual density bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`
                    h-full
                    transition-all
                    duration-300
                    ${densityPercentage < 33 ? 'bg-green-500' : ''}
                    ${densityPercentage >= 33 && densityPercentage < 66 ? 'bg-yellow-500' : ''}
                    ${densityPercentage >= 66 ? 'bg-red-500' : ''}
                  `}
                  style={{ width: `${Math.min(densityPercentage, 100)}%` }}
                  role="progressbar"
                  aria-valuenow={densityPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Density level: ${densityPercentage}%`}
                />
              </div>
            </div>
            
            {/* Trend Indicator */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Trend
              </div>
              <div className={`flex items-center gap-2 ${trendColor}`}>
                <TrendIcon className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {trendLabel}
                </span>
              </div>
            </div>
            
            {/* Last Updated */}
            <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {formattedTimestamp}
              </div>
            </div>
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
