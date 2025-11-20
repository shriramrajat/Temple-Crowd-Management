/**
 * Area Comparison Chart Component
 * 
 * Displays side-by-side density trends for multiple areas.
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
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DensityHistoryEntry } from '@/lib/crowd-risk/types'
import { format } from 'date-fns'

interface AreaComparisonChartProps {
  data: Map<string, DensityHistoryEntry[]>
  areaNames: Map<string, string>
}

/**
 * Generate distinct colors for areas
 */
const AREA_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#a855f7', // purple-500
  '#10b981', // emerald-500
]

/**
 * Area Comparison Chart Component
 * 
 * Requirement 1.1: Compare density trends across multiple areas
 * Requirement 1.4: Side-by-side area comparison views
 */
export function AreaComparisonChart({
  data,
  areaNames,
}: AreaComparisonChartProps) {
  // Transform data for multi-line chart
  const chartData = useMemo(() => {
    // Get all unique timestamps
    const timestamps = new Set<number>()
    data.forEach(entries => {
      entries.forEach(entry => timestamps.add(entry.timestamp))
    })

    // Sort timestamps
    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b)

    // Build chart data with all areas
    return sortedTimestamps.map(timestamp => {
      const dataPoint: any = {
        timestamp,
        time: format(new Date(timestamp), 'HH:mm'),
      }

      // Add density for each area at this timestamp
      data.forEach((entries, areaId) => {
        const entry = entries.find(e => e.timestamp === timestamp)
        if (entry) {
          dataPoint[areaId] = entry.densityValue
        }
      })

      return dataPoint
    })
  }, [data])

  // Get area IDs for lines
  const areaIds = useMemo(() => Array.from(data.keys()), [data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm font-semibold mb-2">
            {format(new Date(data.timestamp), 'MMM dd, HH:mm:ss')}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm flex justify-between gap-4">
                <span style={{ color: entry.color }}>
                  {areaNames.get(entry.dataKey) || entry.dataKey}:
                </span>
                <span className="font-bold">{entry.value?.toFixed(1) || '—'}</span>
              </p>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  if (areaIds.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Area Comparison</CardTitle>
          <CardDescription>
            Compare density trends across multiple areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No data available for comparison</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Comparison</CardTitle>
        <CardDescription>
          Side-by-side density trends for selected areas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
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
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => areaNames.get(value) || value}
            />
            
            {/* Render a line for each area */}
            {areaIds.map((areaId, index) => (
              <Line
                key={areaId}
                type="monotone"
                dataKey={areaId}
                stroke={AREA_COLORS[index % AREA_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                name={areaNames.get(areaId) || areaId}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
