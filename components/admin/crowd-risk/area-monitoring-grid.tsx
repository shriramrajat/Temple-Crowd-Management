'use client'

import * as React from 'react'
import { MapPin, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicatorBadge } from './indicator-badge'
import { cn } from '@/lib/utils'
import { ThresholdLevel } from '@/lib/crowd-risk/types'
import type { MonitoredArea, DensityReading } from '@/lib/crowd-risk/types'

/**
 * AreaMonitoringGrid Component
 * 
 * Displays a grid of monitored areas with real-time density indicators.
 * Optimized for sub-2-second state updates using React.memo and efficient re-rendering.
 * 
 * Requirements:
 * - 4.1: Display visual indicators for each area
 * - 4.2: Color-coded severity levels
 * - 4.4: Sub-2-second state update rendering
 */

interface AreaMonitoringGridProps {
  areas: MonitoredArea[]
  densities: Map<string, DensityReading>
  thresholdLevels: Map<string, ThresholdLevel>
  onAreaClick?: (areaId: string) => void
  className?: string
}

interface AreaCardProps {
  area: MonitoredArea
  density?: DensityReading
  level: ThresholdLevel
  onClick?: () => void
}

// Memoized area card for efficient re-rendering
const AreaCard = React.memo(function AreaCard({
  area,
  density,
  level,
  onClick,
}: AreaCardProps) {
  const densityPercentage = density
    ? Math.round((density.densityValue / area.capacity) * 100)
    : 0

  return (
    <Card
      className={cn(
        'bg-card/50 border-border/50 backdrop-blur-sm transition-all cursor-pointer',
        'hover:border-primary/30 hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <CardTitle className="text-base truncate">{area.name}</CardTitle>
          </div>
          <IndicatorBadge level={level} size="sm" showLabel={false} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Density Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Current Density
            </span>
            <span className="font-semibold">
              {density ? density.densityValue.toFixed(1) : '—'}
            </span>
          </div>
          
          {/* Capacity Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Capacity</span>
              <span>{densityPercentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500',
                  level === ThresholdLevel.NORMAL && 'bg-green-500',
                  level === ThresholdLevel.WARNING && 'bg-yellow-500',
                  level === ThresholdLevel.CRITICAL && 'bg-orange-500',
                  level === ThresholdLevel.EMERGENCY && 'bg-red-600'
                )}
                style={{ width: `${Math.min(densityPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="pt-2 border-t border-border/50">
          <IndicatorBadge level={level} size="sm" />
        </div>

        {/* Area Metadata */}
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3" />
            <span className="capitalize">{area.metadata.type.replace('_', ' ')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

AreaCard.displayName = 'AreaCard'

export const AreaMonitoringGrid = React.memo(function AreaMonitoringGrid({
  areas,
  densities,
  thresholdLevels,
  onAreaClick,
  className,
}: AreaMonitoringGridProps) {
  // Memoize the sorted areas to prevent unnecessary re-sorts
  // Task 17.1: Optimized sorting with stable sort and memoization
  const sortedAreas = React.useMemo(() => {
    return [...areas].sort((a, b) => {
      const levelA = thresholdLevels.get(a.id) || ThresholdLevel.NORMAL
      const levelB = thresholdLevels.get(b.id) || ThresholdLevel.NORMAL
      
      // Sort by severity (emergency first, then critical, warning, normal)
      const severityOrder = {
        [ThresholdLevel.EMERGENCY]: 0,
        [ThresholdLevel.CRITICAL]: 1,
        [ThresholdLevel.WARNING]: 2,
        [ThresholdLevel.NORMAL]: 3,
      }
      
      const orderDiff = severityOrder[levelA] - severityOrder[levelB]
      if (orderDiff !== 0) return orderDiff
      
      // If same severity, sort alphabetically
      return a.name.localeCompare(b.name)
    })
  }, [areas, thresholdLevels])

  // Memoize click handlers to prevent unnecessary re-renders
  // Task 17.1: useCallback optimization for event handlers
  const createClickHandler = React.useCallback((areaId: string) => {
    return onAreaClick ? () => onAreaClick(areaId) : undefined
  }, [onAreaClick])
  
  // Task 17.1: Implement windowing for large area lists (>20 areas)
  // For smaller lists, render all areas normally
  const shouldUseWindowing = areas.length > 20
  
  // Simple windowing: show first 20 areas initially, load more on scroll
  const [visibleCount, setVisibleCount] = React.useState(20)
  const visibleAreas = React.useMemo(() => {
    return shouldUseWindowing ? sortedAreas.slice(0, visibleCount) : sortedAreas
  }, [sortedAreas, visibleCount, shouldUseWindowing])
  
  // Load more areas when scrolling near bottom
  const handleLoadMore = React.useCallback(() => {
    if (visibleCount < sortedAreas.length) {
      setVisibleCount(prev => Math.min(prev + 20, sortedAreas.length))
    }
  }, [visibleCount, sortedAreas.length])
  
  // Intersection observer for infinite scroll
  const observerTarget = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!shouldUseWindowing || !observerTarget.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore()
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(observerTarget.current)
    
    return () => observer.disconnect()
  }, [shouldUseWindowing, handleLoadMore])

  if (areas.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="pt-12 pb-12">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No monitored areas available</p>
            <p className="text-xs mt-1">
              Configure areas to start monitoring crowd density
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
          className
        )}
      >
        {visibleAreas.map((area) => (
          <AreaCard
            key={area.id}
            area={area}
            density={densities.get(area.id)}
            level={thresholdLevels.get(area.id) || ThresholdLevel.NORMAL}
            onClick={createClickHandler(area.id)}
          />
        ))}
      </div>
      
      {/* Intersection observer target for infinite scroll */}
      {shouldUseWindowing && visibleCount < sortedAreas.length && (
        <div ref={observerTarget} className="h-4 w-full" />
      )}
      
      {/* Show loading indicator when more areas are available */}
      {shouldUseWindowing && visibleCount < sortedAreas.length && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Showing {visibleCount} of {sortedAreas.length} areas
        </div>
      )}
    </>
  )
})

AreaMonitoringGrid.displayName = 'AreaMonitoringGrid'
