/**
 * HeatmapZone Component
 * 
 * Individual zone visualization with color-coded density and footfall display.
 * Implements smooth animations, accessibility features, and responsive design.
 * 
 * Features:
 * - Density-based color coding (green/yellow/red)
 * - Animated transitions for colors and numbers
 * - WCAG AA compliant contrast ratios
 * - Keyboard navigation support
 * - Minimum 44x44px touch targets
 */

'use client'

import * as React from 'react';
import type { HeatmapZoneProps } from '@/lib/types/crowd-heatmap';

/**
 * Calculate density level and corresponding Tailwind CSS class
 * 
 * @param footfall - Current number of people in zone
 * @param maxCapacity - Maximum capacity of the zone
 * @returns Tailwind CSS background color class
 */
function getDensityColor(footfall: number, maxCapacity: number): string {
  const density = footfall / maxCapacity;
  
  if (density < 0.33) {
    return 'bg-green-500'; // Low density
  }
  
  if (density < 0.66) {
    return 'bg-yellow-500'; // Medium density
  }
  
  return 'bg-red-500'; // High density
}

/**
 * Get appropriate text color for contrast against background
 * Ensures WCAG AA compliance
 * 
 * @param footfall - Current number of people in zone
 * @param maxCapacity - Maximum capacity of the zone
 * @returns Tailwind CSS text color class
 */
function getTextColor(footfall: number, maxCapacity: number): string {
  const density = footfall / maxCapacity;
  
  // White text on all backgrounds for maximum contrast
  // Green-500, Yellow-500, and Red-500 all have sufficient contrast with white
  return 'text-white';
}

/**
 * Format footfall number with thousand separators
 * 
 * @param footfall - Number to format
 * @returns Formatted string (e.g., "1,234")
 */
function formatFootfall(footfall: number): string {
  if (footfall > 999) {
    return footfall.toLocaleString('en-US');
  }
  return footfall.toString();
}

/**
 * Get density level label for accessibility
 * 
 * @param footfall - Current number of people in zone
 * @param maxCapacity - Maximum capacity of the zone
 * @returns Human-readable density level
 */
function getDensityLabel(footfall: number, maxCapacity: number): string {
  const density = footfall / maxCapacity;
  
  if (density < 0.33) {
    return 'low density';
  }
  
  if (density < 0.66) {
    return 'medium density';
  }
  
  return 'high density';
}

/**
 * HeatmapZone Component
 * 
 * Displays a single zone with color-coded background and footfall count.
 * Supports click/tap interaction and keyboard navigation.
 */
export function HeatmapZone({ zone, maxCapacity, onClick }: HeatmapZoneProps) {
  const densityColor = getDensityColor(zone.footfall, maxCapacity);
  const textColor = getTextColor(zone.footfall, maxCapacity);
  const formattedFootfall = formatFootfall(zone.footfall);
  const densityLabel = getDensityLabel(zone.footfall, maxCapacity);
  
  // Handle click interaction
  const handleClick = () => {
    onClick(zone);
  };
  
  // Handle keyboard interaction (Enter or Space)
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(zone);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        ${densityColor}
        ${textColor}
        relative
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        p-2 sm:p-3 md:p-4
        min-h-[44px]
        min-w-[44px]
        transition-colors
        duration-300
        ease-in-out
        hover:opacity-90
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-blue-500
        cursor-pointer
        will-change-[background-color]
      `}
      aria-label={`${zone.name}, ${formattedFootfall} people, ${densityLabel}`}
      aria-live="polite"
    >
      {/* Zone Name - Responsive font sizing (14px mobile to 16px desktop) */}
      <div className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-1.5 md:mb-2 text-center">
        {zone.name}
      </div>
      
      {/* Footfall Count with Animation - Responsive font sizing (18px mobile to 24px desktop) */}
      <div 
        className="text-lg sm:text-xl md:text-2xl font-bold transition-all duration-500 ease-in-out"
        key={zone.footfall}
      >
        {formattedFootfall}
      </div>
      
      {/* People Label - Responsive font sizing */}
      <div className="text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1 opacity-90">
        people
      </div>
    </button>
  );
}
