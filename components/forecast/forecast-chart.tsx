'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ChartDataPoint } from '@/lib/types/forecast'
import type { CrowdDataResponse } from '@/lib/types/crowd-heatmap'

interface ForecastChartProps {
  data: ChartDataPoint[]
  className?: string
  zoneId?: string // Optional: filter to specific zone
  enableRealTimeOverlay?: boolean // Enable/disable real-time data fetching
}

/**
 * Custom tooltip component for the forecast chart
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const timestamp = label
  const predicted = payload.find((p: any) => p.dataKey === 'predicted')?.value
  const actual = payload.find((p: any) => p.dataKey === 'actual')?.value
  const confidence = payload.find((p: any) => p.dataKey === 'confidence')?.value

  return (
    <div
      className="rounded-lg border bg-card p-3 shadow-lg"
      style={{
        backgroundColor: 'hsl(var(--color-card))',
        borderColor: 'hsl(var(--color-border))',
      }}
    >
      <p className="text-sm font-medium text-foreground mb-2">
        {format(parseISO(timestamp), 'h:mm a')}
      </p>
      {predicted !== undefined && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Expected:</span>
          <span className="font-medium text-foreground">{predicted.toFixed(0)}%</span>
        </div>
      )}
      {actual !== undefined && actual !== null && (
        <div className="flex items-center gap-2 text-sm mt-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Actual:</span>
          <span className="font-medium text-foreground">{actual.toFixed(0)}%</span>
        </div>
      )}
      {confidence !== undefined && (
        <div className="text-xs text-muted-foreground mt-2">
          Confidence: {confidence.toFixed(0)}%
        </div>
      )}
    </div>
  )
}

/**
 * ForecastChart Component
 * 
 * Displays a dual-line chart showing predicted vs actual crowd levels
 * with confidence bands and interactive tooltips.
 * 
 * Features:
 * - Dual-line chart (Expected in blue, Actual in green)
 * - Confidence bands with semi-transparent fill
 * - Interactive tooltips showing exact values and confidence
 * - Real-time data overlay (updates every 30 seconds)
 * - Responsive design for mobile devices
 * - Time axis: -2h to +2h from current time
 * - Y-axis: 0-100% capacity
 * 
 * Requirements: 3.1, 3.2, 3.5, 3.6, 2.3, 3.4, 3.3
 * 
 * @example
 * ```tsx
 * import { ForecastChart } from '@/components/forecast'
 * 
 * // Basic usage
 * <ForecastChart data={chartDataPoints} />
 * 
 * // With zone filter and real-time overlay
 * <ForecastChart 
 *   data={chartDataPoints}
 *   zoneId="zone-main-entrance"
 *   enableRealTimeOverlay={true}
 * />
 * 
 * // Without real-time updates
 * <ForecastChart 
 *   data={chartDataPoints}
 *   enableRealTimeOverlay={false}
 * />
 * ```
 */
export default function ForecastChart({ 
  data, 
  className = '', 
  zoneId,
  enableRealTimeOverlay = true 
}: ForecastChartProps) {
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data)

  useEffect(() => {
    setMounted(true)
  }, [])

  /**
   * Fetch actual crowd data from the API
   * Requirement 3.3: Fetch actual crowd data from /api/crowd-data
   */
  const fetchActualData = useCallback(async () => {
    try {
      const response = await fetch('/api/crowd-data')
      if (!response.ok) {
        throw new Error('Failed to fetch crowd data')
      }
      
      const crowdData: CrowdDataResponse = await response.json()
      
      // Merge actual data with predicted data
      const now = new Date()
      const updatedData = chartData.map(point => {
        const pointTime = parseISO(point.timestamp)
        
        // Only update points that are in the past or current time
        if (pointTime <= now) {
          // Find matching zone data
          const zoneData = zoneId 
            ? crowdData.zones.find(z => z.id === zoneId)
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
      
      setChartData(updatedData)
    } catch (error) {
      console.error('Error fetching actual crowd data:', error)
    }
  }, [chartData, zoneId])

  /**
   * Set up real-time data overlay with 30-second refresh
   * Requirement 3.3: Update actual data every 30 seconds
   */
  useEffect(() => {
    if (!enableRealTimeOverlay || !mounted) {
      return
    }

    // Initial fetch
    fetchActualData()

    // Set up 30-second interval
    const intervalId = setInterval(() => {
      fetchActualData()
    }, 30000) // 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [enableRealTimeOverlay, mounted, fetchActualData])

  /**
   * Update chart data when prop data changes
   */
  useEffect(() => {
    setChartData(data)
  }, [data])

  // Format time for X-axis
  const formatXAxis = (timestamp: string) => {
    try {
      const date = parseISO(timestamp)
      return format(date, 'h:mm a')
    } catch {
      return timestamp
    }
  }

  // Format Y-axis to show percentage
  const formatYAxis = (value: number) => {
    return `${value}%`
  }

  if (!mounted) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-96 flex items-center justify-center ${className}`}>
        <div className="text-muted-foreground">No forecast data available</div>
      </div>
    )
  }

  return (
    <div className={`w-full h-96 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            {/* Gradient for confidence band */}
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--color-border))"
            opacity={0.5}
          />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            stroke="hsl(var(--color-muted-foreground))"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />

          <YAxis
            domain={[0, 100]}
            tickFormatter={formatYAxis}
            stroke="hsl(var(--color-muted-foreground))"
            style={{ fontSize: '12px' }}
            label={{
              value: 'Crowd Level (%)',
              angle: -90,
              position: 'insideLeft',
              style: {
                textAnchor: 'middle',
                fill: 'hsl(var(--color-muted-foreground))',
                fontSize: '12px',
              },
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
            iconType="line"
          />

          {/* Confidence band area */}
          <Area
            type="monotone"
            dataKey="confidenceBandHigh"
            stroke="none"
            fill="url(#confidenceBand)"
            fillOpacity={1}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="confidenceBandLow"
            stroke="none"
            fill="hsl(var(--color-background))"
            fillOpacity={1}
            isAnimationActive={false}
          />

          {/* Expected/Predicted line */}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Expected"
            isAnimationActive={true}
            animationDuration={500}
          />

          {/* Actual line */}
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            name="Actual"
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
