/**
 * Density History Chart Component
 * 
 * Displays historical density data using Recharts line chart.
 * Requirements: 1.1, 1.4
 */

'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThresholdLevel, DensityHistoryEntry } from '@/lib/crowd-risk/types'
import { format } from 'date-fns'

interface DensityHistoryChartProps {
  data: DensityHistoryEntry[]
  areaName: string
  thresholds?: {
    warning: number
    critical: number
    emergency: number
  }
  showThresholds?: boolean
}

/**
 * Get color for threshold level
 */
function getLevelColor(level: ThresholdLevel): string {
  switch (level) {
    case ThresholdLevel.EMERGENCY:
      return '#ef4444' // red-500
    case ThresholdLevel.CRITICAL:
      return '#f97316' // orange-500
    case ThresholdLevel.WARNING:
      return '#eab308' // yellow-500
    case ThresholdLevel.NORMAL:
    default:
      return '#22c55e' // green-500
  }
}

/**
 * Density History Chart Component
 * 
 * Requirement 1.1: Display historical density tracking
 * Requirement 1.4: Visualize density trends over time
 */
export function DensityHistoryChart({
  data,
  areaName,
  thresholds,
  showThresholds = true,
}: DensityHistoryChartProps) {
  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map(entry => ({
      timestamp: entry.timestamp,
      time: format(new Date(entry.timestamp), 'HH:mm'),
      density: entry.densityValue,
      level: entry.thresholdLevel,
    }))
  }, [data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">
            {format(new Date(data.timestamp), 'MMM dd, HH:mm:ss')}
          </p>
          <p className="text-sm mt-1">
            Density: <span className="font-bold">{data.density.toFixed(1)}</span>
          </p>
          <p className="text-sm">
            Level: <span className="font-bold capitalize">{data.level}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Density History - {areaName}</CardTitle>
        <CardDescription>
          Historical density readings with threshold levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={{ value: 'Density', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Threshold reference lines */}
            {showThresholds && thresholds && (
              <>
                <ReferenceLine
                  y={thresholds.warning}
                  stroke="#eab308"
                  strokeDasharray="3 3"
                  label="Warning"
                />
                <ReferenceLine
                  y={thresholds.critical}
                  stroke="#f97316"
                  strokeDasharray="3 3"
                  label="Critical"
                />
                <ReferenceLine
                  y={thresholds.emergency}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="Emergency"
                />
              </>
            )}
            
            <Line
              type="monotone"
              dataKey="density"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name="Density"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
