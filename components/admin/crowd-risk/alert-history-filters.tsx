'use client'

import { useState, useCallback } from 'react'
import { Filter, X, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { ThresholdLevel, AlertType } from '@/lib/crowd-risk/types'

/**
 * Time range presets
 */
export type TimeRangePreset = 'last_hour' | 'last_24_hours' | 'last_7_days' | 'custom'

/**
 * Filter state interface
 */
export interface AlertHistoryFilterState {
  areaIds: string[]
  severities: ThresholdLevel[]
  alertTypes: AlertType[]
  acknowledgmentStatus: 'all' | 'acknowledged' | 'unacknowledged'
  timeRangePreset: TimeRangePreset
  startTime?: number
  endTime?: number
}

/**
 * Alert History Filters Component Props
 */
interface AlertHistoryFiltersProps {
  areas: Array<{ id: string; name: string }>
  filters: AlertHistoryFilterState
  onFiltersChange: (filters: AlertHistoryFilterState) => void
  className?: string
}

/**
 * Alert History Filters Component
 * 
 * Provides comprehensive filtering controls for alert history.
 * Requirements: 14.2 - Multi-select area filtering, severity filtering, time range selection, etc.
 */
export function AlertHistoryFilters({
  areas,
  filters,
  onFiltersChange,
  className,
}: AlertHistoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  /**
   * Handle area selection toggle
   */
  const handleAreaToggle = useCallback((areaId: string) => {
    const newAreaIds = filters.areaIds.includes(areaId)
      ? filters.areaIds.filter(id => id !== areaId)
      : [...filters.areaIds, areaId]
    
    onFiltersChange({ ...filters, areaIds: newAreaIds })
  }, [filters, onFiltersChange])

  /**
   * Handle severity selection toggle
   */
  const handleSeverityToggle = useCallback((severity: ThresholdLevel) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter(s => s !== severity)
      : [...filters.severities, severity]
    
    onFiltersChange({ ...filters, severities: newSeverities })
  }, [filters, onFiltersChange])

  /**
   * Handle alert type selection toggle
   */
  const handleAlertTypeToggle = useCallback((alertType: AlertType) => {
    const newAlertTypes = filters.alertTypes.includes(alertType)
      ? filters.alertTypes.filter(t => t !== alertType)
      : [...filters.alertTypes, alertType]
    
    onFiltersChange({ ...filters, alertTypes: newAlertTypes })
  }, [filters, onFiltersChange])

  /**
   * Handle acknowledgment status change
   */
  const handleAcknowledgmentStatusChange = useCallback((status: 'all' | 'acknowledged' | 'unacknowledged') => {
    onFiltersChange({ ...filters, acknowledgmentStatus: status })
  }, [filters, onFiltersChange])

  /**
   * Handle time range preset change
   */
  const handleTimeRangePresetChange = useCallback((preset: TimeRangePreset) => {
    const now = Date.now()
    let startTime: number | undefined
    let endTime: number | undefined = now

    switch (preset) {
      case 'last_hour':
        startTime = now - 60 * 60 * 1000
        break
      case 'last_24_hours':
        startTime = now - 24 * 60 * 60 * 1000
        break
      case 'last_7_days':
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case 'custom':
        // Keep existing custom dates
        startTime = filters.startTime
        endTime = filters.endTime
        break
    }

    onFiltersChange({
      ...filters,
      timeRangePreset: preset,
      startTime,
      endTime,
    })
  }, [filters, onFiltersChange])

  /**
   * Handle custom date range change
   */
  const handleCustomDateRangeChange = useCallback(() => {
    if (!customStartDate || !customEndDate) return

    const startTime = new Date(customStartDate).getTime()
    const endTime = new Date(customEndDate).getTime()

    onFiltersChange({
      ...filters,
      timeRangePreset: 'custom',
      startTime,
      endTime,
    })
  }, [customStartDate, customEndDate, filters, onFiltersChange])

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      areaIds: [],
      severities: [],
      alertTypes: [],
      acknowledgmentStatus: 'all',
      timeRangePreset: 'last_24_hours',
      startTime: Date.now() - 24 * 60 * 60 * 1000,
      endTime: Date.now(),
    })
    setCustomStartDate('')
    setCustomEndDate('')
  }, [onFiltersChange])

  /**
   * Count active filters
   */
  const activeFilterCount = 
    filters.areaIds.length +
    filters.severities.length +
    filters.alertTypes.length +
    (filters.acknowledgmentStatus !== 'all' ? 1 : 0)

  return (
    <Card className={cn('bg-card/50 border-border/50 backdrop-blur-sm', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-6 pt-4">
              {/* Time Range Selector */}
              <div className="space-y-2">
                <Label>Time Range</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.timeRangePreset === 'last_hour' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePresetChange('last_hour')}
                  >
                    Last Hour
                  </Button>
                  <Button
                    variant={filters.timeRangePreset === 'last_24_hours' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePresetChange('last_24_hours')}
                  >
                    Last 24 Hours
                  </Button>
                  <Button
                    variant={filters.timeRangePreset === 'last_7_days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeRangePresetChange('last_7_days')}
                  >
                    Last 7 Days
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={filters.timeRangePreset === 'custom' ? 'default' : 'outline'}
                        size="sm"
                        className="gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Custom Range
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <input
                            id="start-date"
                            type="datetime-local"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <input
                            id="end-date"
                            type="datetime-local"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          />
                        </div>
                        <Button
                          onClick={handleCustomDateRangeChange}
                          disabled={!customStartDate || !customEndDate}
                          className="w-full"
                        >
                          Apply Custom Range
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Area Filter */}
              <div className="space-y-2">
                <Label>Areas ({filters.areaIds.length} selected)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {areas.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area.id}`}
                        checked={filters.areaIds.includes(area.id)}
                        onCheckedChange={() => handleAreaToggle(area.id)}
                      />
                      <label
                        htmlFor={`area-${area.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {area.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severity Filter */}
              <div className="space-y-2">
                <Label>Severity ({filters.severities.length} selected)</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ThresholdLevel).map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={`severity-${severity}`}
                        checked={filters.severities.includes(severity)}
                        onCheckedChange={() => handleSeverityToggle(severity)}
                      />
                      <label
                        htmlFor={`severity-${severity}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                      >
                        <Badge
                          variant={
                            severity === ThresholdLevel.EMERGENCY ? 'destructive' :
                            severity === ThresholdLevel.CRITICAL ? 'destructive' :
                            severity === ThresholdLevel.WARNING ? 'default' :
                            'secondary'
                          }
                          className={cn(
                            severity === ThresholdLevel.CRITICAL && 'bg-orange-600',
                            severity === ThresholdLevel.WARNING && 'bg-yellow-600'
                          )}
                        >
                          {severity}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert Type Filter */}
              <div className="space-y-2">
                <Label>Alert Type ({filters.alertTypes.length} selected)</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(AlertType).map((alertType) => (
                    <div key={alertType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${alertType}`}
                        checked={filters.alertTypes.includes(alertType)}
                        onCheckedChange={() => handleAlertTypeToggle(alertType)}
                      />
                      <label
                        htmlFor={`type-${alertType}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {alertType.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acknowledgment Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="ack-status">Acknowledgment Status</Label>
                <Select
                  value={filters.acknowledgmentStatus}
                  onValueChange={handleAcknowledgmentStatusChange}
                >
                  <SelectTrigger id="ack-status" className="w-full md:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="unacknowledged">Unacknowledged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
