/**
 * Threshold Breach Timeline Component
 * 
 * Displays a timeline of threshold violations.
 * Requirements: 1.2, 1.4
 */

'use client'

import { useMemo } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertEvent, ThresholdLevel } from '@/lib/crowd-risk/types'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'

interface ThresholdBreachTimelineProps {
  alerts: AlertEvent[]
  areaName?: string
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity: ThresholdLevel): string {
  switch (severity) {
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
 * Get severity order for Y-axis
 */
function getSeverityOrder(severity: ThresholdLevel): number {
  switch (severity) {
    case ThresholdLevel.EMERGENCY:
      return 4
    case ThresholdLevel.CRITICAL:
      return 3
    case ThresholdLevel.WARNING:
      return 2
    case ThresholdLevel.NORMAL:
    default:
      return 1
  }
}

/**
 * Threshold Breach Timeline Component
 * 
 * Requirement 1.2: Visualize threshold violations over time
 * Requirement 1.4: Display alert history timeline
 */
export function ThresholdBreachTimeline({
  alerts,
  areaName,
}: ThresholdBreachTimelineProps) {
  // Transform alerts for scatter chart
  const chartData = useMemo(() => {
    return alerts.map(alert => ({
      timestamp: alert.timestamp,
      time: format(new Date(alert.timestamp), 'HH:mm'),
      severity: alert.severity,
      severityOrder: getSeverityOrder(alert.severity),
      densityValue: alert.densityValue,
      threshold: alert.threshold,
      areaName: alert.areaName,
      id: alert.id,
    }))
  }, [alerts])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" style={{ color: getSeverityColor(data.severity) }} />
            <Badge
              variant="outline"
              style={{
                borderColor: getSeverityColor(data.severity),
                color: getSeverityColor(data.severity),
              }}
            >
              {data.severity.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm font-semibold">
            {format(new Date(data.timestamp), 'MMM dd, HH:mm:ss')}
          </p>
          <p className="text-sm mt-1">
            Area: <span className="font-bold">{data.areaName}</span>
          </p>
          <p className="text-sm">
            Density: <span className="font-bold">{data.densityValue.toFixed(1)}</span>
          </p>
          <p className="text-sm">
            Threshold: <span className="font-bold">{data.threshold.toFixed(1)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Custom Y-axis tick
  const CustomYAxisTick = ({ x, y, payload }: any) => {
    const severityLabels: Record<number, string> = {
      1: 'Normal',
      2: 'Warning',
      3: 'Critical',
      4: 'Emergency',
    }
    
    return (
      <text
        x={x}
        y={y}
        textAnchor="end"
        fill="currentColor"
        className="text-xs"
      >
        {severityLabels[payload.value] || ''}
      </text>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threshold Breach Timeline{areaName ? ` - ${areaName}` : ''}</CardTitle>
          <CardDescription>
            Timeline of threshold violations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>No threshold breaches recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Threshold Breach Timeline{areaName ? ` - ${areaName}` : ''}</CardTitle>
        <CardDescription>
          Timeline of threshold violations by severity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              dataKey="severityOrder"
              domain={[0.5, 4.5]}
              ticks={[1, 2, 3, 4]}
              tick={<CustomYAxisTick />}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
