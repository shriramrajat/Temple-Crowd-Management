'use client'

import { useEffect, useState, useCallback } from 'react'
import { format, parseISO } from 'date-fns'
import { PeakHoursResponse, PeakPeriod } from '@/lib/types/forecast'
import { Clock, TrendingUp, Users, AlertCircle } from 'lucide-react'

interface PeakHoursDisplayProps {
  className?: string
  date?: string // Optional: specific date (defaults to today)
  autoRefresh?: boolean // Enable/disable auto-refresh (default: true)
  refreshInterval?: number // Refresh interval in milliseconds (default: 15 minutes)
}

/**
 * PeakHoursDisplay Component
 * 
 * Displays identified peak hours for the day with visual indicators
 * for crowd level severity.
 * 
 * Features:
 * - List of peak periods with time ranges
 * - Expected footfall and capacity percentages
 * - Visual indicators for crowd level severity (high/very-high)
 * - Auto-refresh every 15 minutes
 * - Loading and error state handling
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * 
 * @example
 * ```tsx
 * import { PeakHoursDisplay } from '@/components/forecast'
 * 
 * // Basic usage with auto-refresh
 * <PeakHoursDisplay />
 * 
 * // Specific date without auto-refresh
 * <PeakHoursDisplay 
 *   date="2025-11-16"
 *   autoRefresh={false}
 * />
 * 
 * // Custom refresh interval (10 minutes)
 * <PeakHoursDisplay 
 *   refreshInterval={600000}
 * />
 * ```
 */
export default function PeakHoursDisplay({
  className = '',
  date,
  autoRefresh = true,
  refreshInterval = 900000, // 15 minutes in milliseconds
}: PeakHoursDisplayProps) {
  const [peakHours, setPeakHours] = useState<PeakHoursResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Fetch peak hours from the API
   * Requirement 1.4: Fetch peak hours from /api/peak-hours
   */
  const fetchPeakHours = useCallback(async () => {
    try {
      setError(null)
      
      // Build URL with optional date parameter
      const url = date 
        ? `/api/peak-hours?date=${date}`
        : '/api/peak-hours'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch peak hours: ${response.statusText}`)
      }
      
      const data: PeakHoursResponse = await response.json()
      setPeakHours(data)
    } catch (err) {
      console.error('Error fetching peak hours:', err)
      setError(err instanceof Error ? err.message : 'Failed to load peak hours')
    } finally {
      setLoading(false)
    }
  }, [date])

  /**
   * Set up auto-refresh mechanism
   * Requirement 1.4: Update display every 15 minutes
   */
  useEffect(() => {
    if (!mounted) {
      return
    }

    // Initial fetch
    fetchPeakHours()

    if (!autoRefresh) {
      return
    }

    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchPeakHours()
    }, refreshInterval)

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [mounted, autoRefresh, refreshInterval, fetchPeakHours])

  /**
   * Get visual indicator for crowd level
   * Requirement 1.3: Visual indicators for crowd level severity
   */
  const getCrowdLevelIndicator = (crowdLevel: 'high' | 'very-high') => {
    if (crowdLevel === 'very-high') {
      return {
        icon: '🔴',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Very High',
      }
    }
    return {
      icon: '🟡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      label: 'High',
    }
  }

  /**
   * Format capacity percentage
   * Requirement 1.2: Show expected footfall and capacity percentages
   */
  const formatCapacityPercentage = (footfall: number, capacity: number): string => {
    const percentage = Math.round((footfall / capacity) * 100)
    return `${percentage}%`
  }

  /**
   * Render loading state
   */
  if (!mounted || loading) {
    return (
      <div className={`rounded-lg border bg-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Peak Hours Today</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading peak hours...</div>
        </div>
      </div>
    )
  }

  /**
   * Render error state
   * Requirement 1.4: Handle loading and error states
   */
  if (error) {
    return (
      <div className={`rounded-lg border bg-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Peak Hours Today</h3>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Error loading peak hours</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Render empty state
   */
  if (!peakHours || peakHours.peaks.length === 0) {
    return (
      <div className={`rounded-lg border bg-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Peak Hours Today</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No peak hours identified</p>
          <p className="text-xs text-muted-foreground mt-1">
            Crowd levels are expected to remain moderate throughout the day
          </p>
        </div>
      </div>
    )
  }

  /**
   * Render peak hours list
   * Requirements: 1.1, 1.2, 1.3
   */
  return (
    <div className={`rounded-lg border bg-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Peak Hours Today</h3>
        </div>
        {peakHours.metadata.dataSource === 'simulated' && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Simulated
          </span>
        )}
      </div>

      {/* Date display */}
      <p className="text-sm text-muted-foreground mb-4">
        {format(parseISO(peakHours.date), 'EEEE, MMMM d, yyyy')}
      </p>

      {/* Peak periods list */}
      <div className="space-y-3">
        {peakHours.peaks.map((peak: PeakPeriod, index: number) => {
          const indicator = getCrowdLevelIndicator(peak.crowdLevel)
          const capacityPercentage = formatCapacityPercentage(
            peak.expectedFootfall,
            peak.capacity
          )

          return (
            <div
              key={`${peak.zoneId}-${index}`}
              className={`rounded-lg border p-4 transition-colors hover:bg-accent/50 ${indicator.borderColor} ${indicator.bgColor}`}
            >
              {/* Zone name and indicator */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label={indicator.label}>
                    {indicator.icon}
                  </span>
                  <div>
                    <h4 className="font-medium text-foreground">{peak.zoneName}</h4>
                    <span className={`text-xs font-medium ${indicator.color}`}>
                      {indicator.label} Crowd
                    </span>
                  </div>
                </div>
              </div>

              {/* Time range */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4" />
                <span>
                  {peak.startTime} - {peak.endTime}
                </span>
              </div>

              {/* Expected footfall */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Expected:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {peak.expectedFootfall.toLocaleString()} / {peak.capacity.toLocaleString()}
                  </span>
                  <span className={`font-semibold ${indicator.color}`}>
                    ({capacityPercentage})
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Last updated timestamp */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {format(parseISO(peakHours.metadata.calculatedAt), 'h:mm a')}
          {autoRefresh && ' • Auto-refreshing every 15 minutes'}
        </p>
      </div>
    </div>
  )
}
