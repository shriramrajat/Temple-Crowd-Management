'use client'

import { useState, useEffect, useCallback } from 'react'
import ForecastChart from './forecast-chart'
import PeakHoursDisplay from './peak-hours-display'
import { ChartDataPoint, ForecastResponse, ForecastPoint } from '@/lib/types/forecast'
import type { CrowdDataResponse } from '@/lib/types/crowd-heatmap'
import { parseISO } from 'date-fns'
import { AlertCircle, AlertTriangle, Database, TrendingUp } from 'lucide-react'

interface ForecastDashboardProps {
  zoneId?: string // Optional: filter to specific zone
  showPeakHours?: boolean // Default: true
  className?: string
}

/**
 * ForecastDashboard Component
 * 
 * Main container component for forecast visualization that combines
 * the ForecastChart and PeakHoursDisplay components with data fetching,
 * auto-refresh, and error handling.
 * 
 * Features:
 * - Combines ForecastChart and PeakHoursDisplay components
 * - Optional zone filter dropdown
 * - Responsive grid layout
 * - Auto-refresh mechanism (5 min for forecast, 30s for actual data)
 * - Error handling and fallbacks
 * - Data source indicators
 * 
 * Requirements: 3.1, 3.2, 3.3, 2.4, 2.5, 5.2
 * 
 * @example
 * ```tsx
 * import { ForecastDashboard } from '@/components/forecast'
 * 
 * // Basic usage
 * <ForecastDashboard />
 * 
 * // With zone filter
 * <ForecastDashboard zoneId="zone-main-entrance" />
 * 
 * // Without peak hours display
 * <ForecastDashboard showPeakHours={false} />
 * ```
 */
export default function ForecastDashboard({
  zoneId,
  showPeakHours = true,
  className = '',
}: ForecastDashboardProps) {
  const [selectedZone] = useState<string | undefined>(zoneId)
  // Note: setSelectedZone will be used when zone filter dropdown is implemented
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forecastMetadata, setForecastMetadata] = useState<ForecastResponse['metadata'] | null>(null)

  /**
   * Fetch forecast data from /api/forecast
   * Requirement 2.4: Fetch forecast data from /api/forecast
   */
  const fetchForecastData = useCallback(async () => {
    try {
      setError(null)
      
      // Build URL with optional zoneId parameter
      const url = selectedZone 
        ? `/api/forecast?zoneId=${selectedZone}`
        : '/api/forecast'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch forecast: ${response.statusText}`)
      }
      
      const forecastData: ForecastResponse = await response.json()
      setForecastMetadata(forecastData.metadata)
      
      // Convert forecast points to chart data points
      const chartPoints = convertToChartData(forecastData.predictions)
      setChartData(chartPoints)
      
    } catch (err) {
      console.error('Error fetching forecast data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load forecast')
    } finally {
      setLoading(false)
    }
  }, [selectedZone])

  /**
   * Fetch actual crowd data from /api/crowd-data
   * Requirement 3.3: Fetch actual data from /api/crowd-data
   */
  const fetchActualData = useCallback(async () => {
    try {
      const response = await fetch('/api/crowd-data')
      
      if (!response.ok) {
        throw new Error('Failed to fetch crowd data')
      }
      
      const crowdData: CrowdDataResponse = await response.json()
      
      // Merge actual data with existing chart data
      mergeActualData(crowdData)
      
    } catch (err) {
      console.error('Error fetching actual crowd data:', err)
      // Don't set error state for actual data failures - just log
    }
  }, [])

  /**
   * Convert forecast points to chart data format
   * Requirement 2.4: Merge data for chart display
   */
  const convertToChartData = (predictions: ForecastPoint[]): ChartDataPoint[] => {
    return predictions.map(point => {
      const confidenceDecimal = point.confidence / 100
      const predictedPercentage = (point.predictedFootfall / point.capacity) * 100
      
      // Calculate confidence bands (±10% of prediction based on confidence)
      const bandWidth = predictedPercentage * (1 - confidenceDecimal) * 0.5
      
      return {
        timestamp: point.timestamp,
        predicted: predictedPercentage,
        actual: point.actualFootfall 
          ? (point.actualFootfall / point.capacity) * 100 
          : null,
        confidence: point.confidence,
        confidenceBandLow: Math.max(0, predictedPercentage - bandWidth),
        confidenceBandHigh: Math.min(100, predictedPercentage + bandWidth),
      }
    })
  }

  /**
   * Merge actual crowd data with chart data
   * Requirement 3.3: Merge data for chart display
   */
  const mergeActualData = (crowdData: CrowdDataResponse) => {
    const now = new Date()
    
    setChartData(prevData => 
      prevData.map(point => {
        const pointTime = parseISO(point.timestamp)
        
        // Only update points that are in the past or current time
        if (pointTime <= now) {
          // Find matching zone data
          const zoneData = selectedZone 
            ? crowdData.zones.find(z => z.id === selectedZone)
            : crowdData.zones[0] // Default to first zone if no zoneId specified
          
          if (zoneData) {
            // Calculate percentage of capacity
            const actualPercentage = (zoneData.footfall / zoneData.capacity) * 100
            
            return {
              ...point,
              actual: actualPercentage
            }
          }
        }
        
        return point
      })
    )
  }

  /**
   * Initial data fetch on mount
   * Requirement 2.4: Handle loading states
   */
  useEffect(() => {
    fetchForecastData()
  }, [fetchForecastData])

  /**
   * Set up auto-refresh for forecast data (5 minutes)
   * Requirement 2.4: Set up 5-minute interval for forecast refresh
   */
  useEffect(() => {
    // Set up 5-minute interval for forecast refresh
    const forecastIntervalId = setInterval(() => {
      fetchForecastData()
    }, 300000) // 5 minutes in milliseconds

    // Cleanup on unmount
    return () => {
      clearInterval(forecastIntervalId)
    }
  }, [fetchForecastData])

  /**
   * Set up auto-refresh for actual data (30 seconds)
   * Requirement 3.3: Set up 30-second interval for actual data refresh
   */
  useEffect(() => {
    // Initial fetch of actual data
    fetchActualData()

    // Set up 30-second interval for actual data refresh
    const actualDataIntervalId = setInterval(() => {
      fetchActualData()
    }, 30000) // 30 seconds in milliseconds

    // Cleanup on unmount
    return () => {
      clearInterval(actualDataIntervalId)
    }
  }, [fetchActualData])

  /**
   * Render loading state
   * Requirement 2.4: Handle loading states
   */
  if (loading) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crowd Forecast</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered predictions for the next 2 hours
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center justify-center h-96">
                <div className="animate-pulse text-muted-foreground">Loading forecast...</div>
              </div>
            </div>
          </div>
          {showPeakHours && (
            <div className="lg:col-span-1">
              <PeakHoursDisplay 
                autoRefresh={true}
                refreshInterval={900000}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  /**
   * Get data source indicator details
   * Requirement 5.2: Show data source indicators (historical vs simulated)
   */
  const getDataSourceIndicator = () => {
    if (!forecastMetadata) return null

    const { dataSource } = forecastMetadata

    const indicators = {
      historical: {
        icon: Database,
        label: 'Historical Data',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'Predictions based on actual historical patterns',
      },
      simulated: {
        icon: TrendingUp,
        label: 'Simulated Data',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Predictions based on typical patterns',
      },
      hybrid: {
        icon: Database,
        label: 'Hybrid Data',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Predictions based on historical and simulated data',
      },
    }

    return indicators[dataSource]
  }

  /**
   * Check if forecast has low confidence
   * Requirement 2.5: Handle low confidence scenarios
   */
  const hasLowConfidence = () => {
    if (chartData.length === 0) return false
    const avgConfidence = chartData.reduce((sum, point) => sum + point.confidence, 0) / chartData.length
    return avgConfidence < 60
  }

  /**
   * Render error state
   * Requirement 2.5: Display user-friendly error messages
   */
  if (error) {
    return (
      <div className={`w-full space-y-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crowd Forecast</h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-powered predictions for the next 2 hours
            </p>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Unable to Load Forecast
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  fetchForecastData()
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const dataSourceIndicator = getDataSourceIndicator()
  const showLowConfidenceWarning = hasLowConfidence()

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Header with optional zone filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crowd Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered predictions for the next 2 hours
          </p>
        </div>

        {/* Zone filter dropdown - placeholder for now */}
        {/* Will be implemented with actual zone data */}
      </div>

      {/* Data source indicator */}
      {dataSourceIndicator && (
        <div className={`rounded-lg border p-4 ${dataSourceIndicator.bgColor} ${dataSourceIndicator.borderColor}`}>
          <div className="flex items-center gap-3">
            <dataSourceIndicator.icon className={`w-5 h-5 ${dataSourceIndicator.color}`} />
            <div>
              <p className={`text-sm font-medium ${dataSourceIndicator.color}`}>
                {dataSourceIndicator.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dataSourceIndicator.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Low confidence warning */}
      {showLowConfidenceWarning && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Low Confidence Forecast
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Predictions may be less accurate due to limited historical data. 
                Use these forecasts as general guidance only.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main content grid - responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast chart - takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Expected vs Actual Crowd Levels
            </h2>
            <ForecastChart 
              data={chartData} 
              zoneId={selectedZone}
              enableRealTimeOverlay={false} // Dashboard handles data fetching
            />
          </div>
        </div>

        {/* Peak hours display - takes 1 column on large screens */}
        {showPeakHours && (
          <div className="lg:col-span-1">
            <PeakHoursDisplay 
              autoRefresh={true}
              refreshInterval={900000} // 15 minutes
            />
          </div>
        )}
      </div>
    </div>
  )
}
