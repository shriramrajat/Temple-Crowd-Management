/**
 * Time Range Selector Component
 * 
 * Allows selection of time range for historical data viewing.
 * Requirements: 1.4
 */

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Clock } from 'lucide-react'

export type TimeRange = '1h' | '6h' | '24h' | '7d'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

/**
 * Time range options with labels and durations
 */
const TIME_RANGES: Array<{
  value: TimeRange
  label: string
  duration: number // in milliseconds
}> = [
  { value: '1h', label: '1 Hour', duration: 60 * 60 * 1000 },
  { value: '6h', label: '6 Hours', duration: 6 * 60 * 60 * 1000 },
  { value: '24h', label: '24 Hours', duration: 24 * 60 * 60 * 1000 },
  { value: '7d', label: '7 Days', duration: 7 * 24 * 60 * 60 * 1000 },
]

/**
 * Get duration in milliseconds for a time range
 */
export function getTimeRangeDuration(range: TimeRange): number {
  const option = TIME_RANGES.find(r => r.value === range)
  return option?.duration || 60 * 60 * 1000 // default to 1 hour
}

/**
 * Time Range Selector Component
 * 
 * Requirement 1.4: Implement time range selector for historical data
 */
export function TimeRangeSelector({
  value,
  onChange,
  className,
}: TimeRangeSelectorProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground mr-2">Time Range:</span>
      <div className="flex gap-1">
        {TIME_RANGES.map(range => (
          <Button
            key={range.value}
            variant={value === range.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(range.value)}
            className={cn(
              'text-xs',
              value === range.value && 'bg-primary text-primary-foreground'
            )}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
