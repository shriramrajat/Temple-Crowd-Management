'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LocationData, LocationError } from '@/lib/types/sos'
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Map
} from 'lucide-react'

/**
 * Location Display Component Props
 * Requirements: 4.1, 4.2, 4.5
 */
export interface LocationDisplayProps {
  /** Location data to display */
  location: LocationData | null
  
  /** Loading state while fetching location */
  loading?: boolean
  
  /** Error information if location capture failed */
  error?: LocationError | null
  
  /** Whether to show the map preview placeholder */
  showMapPreview?: boolean
  
  /** Additional CSS classes */
  className?: string
}

/**
 * LocationDisplay Component
 * 
 * Displays location information including coordinates, accuracy, and address.
 * Features:
 * - Shows latitude, longitude, accuracy, and address
 * - Loading state while fetching location
 * - Error messages for location failures
 * - Map preview placeholder (optional for MVP)
 * - Accessible and responsive design
 * 
 * Requirements: 4.1, 4.2, 4.5
 */
export function LocationDisplay({
  location,
  loading = false,
  error = null,
  showMapPreview = false,
  className,
}: LocationDisplayProps) {
  /**
   * Format coordinate to display with appropriate precision
   */
  const formatCoordinate = (value: number, decimals: number = 6): string => {
    return value.toFixed(decimals)
  }

  /**
   * Format accuracy to human-readable text
   */
  const formatAccuracy = (accuracy: number): string => {
    if (accuracy < 10) {
      return 'Very accurate'
    } else if (accuracy < 50) {
      return 'Accurate'
    } else if (accuracy < 100) {
      return 'Moderate accuracy'
    } else {
      return 'Low accuracy'
    }
  }

  /**
   * Format timestamp to readable time
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  /**
   * Render loading state
   * Requirement: Display loading state while fetching location
   */
  if (loading) {
    return (
      <div 
        className={cn(
          'w-full rounded-lg border-2 border-dashed border-muted-foreground/30',
          'bg-muted/30 p-4 sm:p-6',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Fetching location"
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
          <Loader2 className="size-6 sm:size-8 animate-spin text-primary" />
          <div className="space-y-1">
            <p className="font-medium text-sm sm:text-base text-foreground">
              Getting your location...
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              This may take a few seconds
            </p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render error state
   * Requirement: 4.5 - Show error messages for location failures
   */
  if (error) {
    return (
      <div 
        className={cn(
          'w-full rounded-lg border-2 border-destructive/50',
          'bg-destructive/10 p-4 sm:p-6',
          className
        )}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
          <AlertCircle className="size-6 sm:size-8 text-destructive" />
          <div className="space-y-1">
            <p className="font-medium text-sm sm:text-base text-destructive">
              Location Error
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render empty state (no location yet)
   */
  if (!location) {
    return (
      <div 
        className={cn(
          'w-full rounded-lg border-2 border-dashed border-muted-foreground/30',
          'bg-muted/30 p-4 sm:p-6',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-center">
          <MapPin className="size-6 sm:size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium text-sm sm:text-base text-muted-foreground">
              No location data
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Location will be captured when you send an alert
            </p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render location data
   * Requirements: 4.1, 4.2 - Show latitude, longitude, accuracy, and address
   */
  return (
    <div 
      className={cn(
        'w-full rounded-lg border-2 border-green-200',
        'bg-green-50 dark:bg-green-950/20 dark:border-green-800',
        className
      )}
      role="region"
      aria-label="Location information"
    >
      {/* Header with success indicator */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-green-200 dark:border-green-800">
        <CheckCircle2 className="size-4 sm:size-5 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm sm:text-base text-green-900 dark:text-green-100 truncate">
            Location Captured
          </h3>
          <p className="text-xs text-green-700 dark:text-green-300">
            {formatTimestamp(location.timestamp)}
          </p>
        </div>
      </div>

      {/* Location details */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Address (if available) */}
        {location.address && (
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="size-3.5 sm:size-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                  Address
                </p>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 break-words">
                  {location.address}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Zone (if available) */}
        {location.zone && (
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <Map className="size-3.5 sm:size-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                  Zone
                </p>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                  {location.zone}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Coordinates */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Navigation className="size-3.5 sm:size-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100">
                Coordinates
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs font-mono">
                <div className="truncate">
                  <span className="text-green-600 dark:text-green-400">Lat:</span>{' '}
                  <span className="text-green-700 dark:text-green-300">
                    {formatCoordinate(location.latitude)}
                  </span>
                </div>
                <div className="truncate">
                  <span className="text-green-600 dark:text-green-400">Lng:</span>{' '}
                  <span className="text-green-700 dark:text-green-300">
                    {formatCoordinate(location.longitude)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accuracy indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-green-200 dark:border-green-800">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-700 dark:text-green-300 truncate">
              Accuracy: {formatAccuracy(location.accuracy)} (±{Math.round(location.accuracy)}m)
            </p>
          </div>
        </div>

        {/* Map preview placeholder (optional for MVP) */}
        {showMapPreview && (
          <div className="pt-2 border-t border-green-200 dark:border-green-800">
            <div 
              className="w-full h-32 rounded-md bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center"
              aria-label="Map preview placeholder"
            >
              <div className="text-center space-y-1">
                <Map className="size-6 text-green-600 dark:text-green-400 mx-auto" />
                <p className="text-xs text-green-700 dark:text-green-300">
                  Map preview coming soon
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Export display name for debugging
 */
LocationDisplay.displayName = 'LocationDisplay'
