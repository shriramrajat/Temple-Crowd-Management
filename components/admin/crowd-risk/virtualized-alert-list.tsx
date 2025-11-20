'use client'

import React from 'react'
import { AlertEvent } from '@/lib/crowd-risk/types'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * VirtualizedAlertList Component
 * 
 * Implements virtual scrolling for large alert lists to optimize rendering performance.
 * Only renders visible items plus a buffer, significantly improving performance for lists
 * with hundreds or thousands of alerts.
 * 
 * Requirements:
 * - 17.1: Implement virtual scrolling for large alert lists
 * - Performance: Render only visible items to reduce DOM nodes
 */

interface VirtualizedAlertListProps {
  alerts: AlertEvent[]
  renderItem: (alert: AlertEvent, index: number) => React.ReactNode
  itemHeight?: number
  overscan?: number
  className?: string
  emptyMessage?: string
}

export const VirtualizedAlertList = React.memo(function VirtualizedAlertList({
  alerts,
  renderItem,
  itemHeight = 80,
  overscan = 3,
  className,
  emptyMessage = 'No alerts to display',
}: VirtualizedAlertListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [containerHeight, setContainerHeight] = React.useState(600)

  // Memoize total height calculation
  const totalHeight = React.useMemo(() => {
    return alerts.length * itemHeight
  }, [alerts.length, itemHeight])

  // Memoize visible range calculation
  const visibleRange = React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      alerts.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    return { startIndex, endIndex }
  }, [scrollTop, containerHeight, itemHeight, overscan, alerts.length])

  // Memoize visible items
  const visibleItems = React.useMemo(() => {
    return alerts.slice(visibleRange.startIndex, visibleRange.endIndex)
  }, [alerts, visibleRange.startIndex, visibleRange.endIndex])

  // Memoize offset calculation
  const offsetY = React.useMemo(() => {
    return visibleRange.startIndex * itemHeight
  }, [visibleRange.startIndex, itemHeight])

  // Handle scroll events with throttling
  const handleScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    setScrollTop(target.scrollTop)
  }, [])

  // Measure container height on mount and resize
  React.useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const updateHeight = () => {
      setContainerHeight(container.clientHeight)
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ScrollArea
      ref={scrollRef}
      className={className}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {visibleItems.map((alert, index) => (
            <div
              key={alert.id}
              style={{
                height: `${itemHeight}px`,
              }}
            >
              {renderItem(alert, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
})

VirtualizedAlertList.displayName = 'VirtualizedAlertList'

/**
 * Hook to optimize alert list rendering with windowing
 * 
 * For smaller lists (< 50 items), returns all items.
 * For larger lists, implements virtual scrolling automatically.
 * 
 * @param alerts - Array of alerts to render
 * @param threshold - Threshold for enabling virtual scrolling (default: 50)
 * @returns Object with shouldVirtualize flag and alerts
 */
export function useAlertListOptimization(
  alerts: AlertEvent[],
  threshold: number = 50
) {
  const shouldVirtualize = React.useMemo(() => {
    return alerts.length > threshold
  }, [alerts.length, threshold])

  return React.useMemo(() => ({
    shouldVirtualize,
    alerts,
    count: alerts.length,
  }), [shouldVirtualize, alerts])
}
