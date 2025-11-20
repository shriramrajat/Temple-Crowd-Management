/**
 * Alert Frequency Statistics Component
 * 
 * Displays alert frequency statistics by area and severity.
 * Requirements: 1.4
 */

'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertEvent, ThresholdLevel } from '@/lib/crowd-risk/types'

interface AlertFrequencyStatsProps {
  alerts: AlertEvent[]
  groupBy: 'area' | 'severity'
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
 * Alert Frequency Statistics Component
 * 
 * Requirement 1.4: Display alert frequency statistics
 */
export function AlertFrequencyStats({
  alerts,
  groupBy,
}: AlertFrequencyStatsProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (groupBy === 'area') {
      // Group by area
      const areaStats = new Map<string, {
        areaName: string
        emergency: number
        critical: number
        warning: number
        normal: number
        total: number
      }>()

      alerts.forEach(alert => {
        const existing = areaStats.get(alert.areaId) || {
          areaName: alert.areaName,
          emergency: 0,
          critical: 0,
          warning: 0,
          normal: 0,
          total: 0,
        }

        existing.total++
        
        switch (alert.severity) {
          case ThresholdLevel.EMERGENCY:
            existing.emergency++
            break
          case ThresholdLevel.CRITICAL:
            existing.critical++
            break
          case ThresholdLevel.WARNING:
            existing.warning++
            break
          case ThresholdLevel.NORMAL:
            existing.normal++
            break
        }

        areaStats.set(alert.areaId, existing)
      })

      return Array.from(areaStats.values()).sort((a, b) => b.total - a.total)
    } else {
      // Group by severity
      const severityStats = {
        emergency: 0,
        critical: 0,
        warning: 0,
        normal: 0,
      }

      alerts.forEach(alert => {
        switch (alert.severity) {
          case ThresholdLevel.EMERGENCY:
            severityStats.emergency++
            break
          case ThresholdLevel.CRITICAL:
            severityStats.critical++
            break
          case ThresholdLevel.WARNING:
            severityStats.warning++
            break
          case ThresholdLevel.NORMAL:
            severityStats.normal++
            break
        }
      })

      return [
        { name: 'Emergency', count: severityStats.emergency, severity: ThresholdLevel.EMERGENCY },
        { name: 'Critical', count: severityStats.critical, severity: ThresholdLevel.CRITICAL },
        { name: 'Warning', count: severityStats.warning, severity: ThresholdLevel.WARNING },
        { name: 'Normal', count: severityStats.normal, severity: ThresholdLevel.NORMAL },
      ]
    }
  }, [alerts, groupBy])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      if (groupBy === 'area') {
        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-semibold mb-2">{data.areaName}</p>
            <div className="space-y-1 text-xs">
              <p className="flex justify-between gap-4">
                <span className="text-red-500">Emergency:</span>
                <span className="font-bold">{data.emergency}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-orange-500">Critical:</span>
                <span className="font-bold">{data.critical}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-yellow-500">Warning:</span>
                <span className="font-bold">{data.warning}</span>
              </p>
              <p className="flex justify-between gap-4 pt-1 border-t border-border">
                <span>Total:</span>
                <span className="font-bold">{data.total}</span>
              </p>
            </div>
          </div>
        )
      } else {
        return (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <p className="text-sm font-semibold">{data.name}</p>
            <p className="text-sm mt-1">
              Count: <span className="font-bold">{data.count}</span>
            </p>
          </div>
        )
      }
    }
    return null
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alert Frequency Statistics</CardTitle>
          <CardDescription>
            Alert counts by {groupBy}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>No alerts recorded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Frequency Statistics</CardTitle>
        <CardDescription>
          Alert counts by {groupBy}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {groupBy === 'area' ? (
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="areaName"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Alert Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="emergency" stackId="a" fill="#ef4444" name="Emergency" />
              <Bar dataKey="critical" stackId="a" fill="#f97316" name="Critical" />
              <Bar dataKey="warning" stackId="a" fill="#eab308" name="Warning" />
              <Bar dataKey="normal" stackId="a" fill="#22c55e" name="Normal" />
            </BarChart>
          ) : (
            <BarChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                label={{ value: 'Alert Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Count">
                {stats.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
