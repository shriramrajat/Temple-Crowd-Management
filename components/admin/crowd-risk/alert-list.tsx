'use client'

import * as React from 'react'
import { AlertTriangle, Clock, MapPin, Filter, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertEvent, ThresholdLevel } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'

/**
 * Alert List Component
 * 
 * Displays recent alerts with filtering by severity and area.
 * Requirements:
 * - 2.2: Display recent alerts list with filtering
 */

interface AlertListProps {
  alerts: AlertEvent[]
  areas: Array<{ id: string; name: string }>
  onAlertClick?: (alert: AlertEvent) => void
  onAcknowledge?: (alertId: string) => void
  isAlertAcknowledged?: (alertId: string) => boolean
  className?: string
}

// Memoized alert item component for efficient re-rendering
const AlertItem = React.memo(function AlertItem({
  alert,
  isAcknowledged,
  severityColors,
  onAlertClick,
  onAcknowledge,
}: {
  alert: AlertEvent;
  isAcknowledged: boolean;
  severityColors: Record<string, string>;
  onAlertClick?: (alert: AlertEvent) => void;
  onAcknowledge?: (alertId: string) => void;
}) {
  const alertDate = new Date(alert.timestamp);
  const timeAgo = Math.floor((Date.now() - alert.timestamp) / 1000);
  
  let timeAgoText = '';
  if (timeAgo < 60) {
    timeAgoText = `${timeAgo}s ago`;
  } else if (timeAgo < 3600) {
    timeAgoText = `${Math.floor(timeAgo / 60)}m ago`;
  } else {
    timeAgoText = `${Math.floor(timeAgo / 3600)}h ago`;
  }

  const handleClick = React.useCallback(() => {
    onAlertClick?.(alert);
  }, [alert, onAlertClick]);

  const handleAcknowledge = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAcknowledge?.(alert.id);
  }, [alert.id, onAcknowledge]);

  return (
    <div
      className={cn(
        'p-4 rounded-lg border transition-all',
        'hover:border-primary/50 cursor-pointer',
        isAcknowledged 
          ? 'bg-muted/30 border-border/50 opacity-75'
          : 'bg-card border-border'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn('capitalize', severityColors[alert.severity])}>
              {alert.severity}
            </Badge>
            {isAcknowledged && (
              <Badge variant="outline" className="text-xs">
                Acknowledged
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {timeAgoText}
            </span>
          </div>

          {/* Area Name */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-semibold text-sm">{alert.areaName}</span>
          </div>

          {/* Density Info */}
          <div className="text-sm text-muted-foreground">
            Density: <span className="font-medium text-foreground">
              {alert.densityValue.toFixed(1)}
            </span>
            {' / '}
            Threshold: <span className="font-medium text-foreground">
              {alert.threshold.toFixed(1)}
            </span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{alertDate.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Actions */}
        {!isAcknowledged && onAcknowledge && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleAcknowledge}
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
});

AlertItem.displayName = 'AlertItem';

// Virtualized alert list for performance with large lists
const VirtualizedAlertList = React.memo(function VirtualizedAlertList({
  alerts,
  isAlertAcknowledged,
  severityColors,
  onAlertClick,
  onAcknowledge,
}: {
  alerts: AlertEvent[];
  isAlertAcknowledged?: (alertId: string) => boolean;
  severityColors: Record<string, string>;
  onAlertClick?: (alert: AlertEvent) => void;
  onAcknowledge?: (alertId: string) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = React.useState({ start: 0, end: 20 });
  
  // Estimated height per alert item (in pixels)
  const ITEM_HEIGHT = 140;
  const BUFFER_SIZE = 5; // Number of items to render outside visible area
  
  // Handle scroll to update visible range
  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    const containerHeight = scrollRef.current.clientHeight;
    
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const end = Math.min(
      alerts.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    );
    
    setVisibleRange({ start, end });
  }, [alerts.length]);
  
  // Throttle scroll handler for better performance
  const throttledHandleScroll = React.useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return () => {
      if (timeoutId) return;
      
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 16); // ~60fps
    };
  }, [handleScroll]);
  
  // Update visible range on mount and when alerts change
  React.useEffect(() => {
    handleScroll();
  }, [alerts.length, handleScroll]);
  
  // Only render alerts in visible range for large lists
  const shouldVirtualize = alerts.length > 50;
  const visibleAlerts = shouldVirtualize
    ? alerts.slice(visibleRange.start, visibleRange.end)
    : alerts;
  
  const topPadding = shouldVirtualize ? visibleRange.start * ITEM_HEIGHT : 0;
  const bottomPadding = shouldVirtualize
    ? (alerts.length - visibleRange.end) * ITEM_HEIGHT
    : 0;
  
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div
        ref={scrollRef}
        onScroll={throttledHandleScroll}
        className="space-y-3"
      >
        {/* Top padding for virtualization */}
        {topPadding > 0 && <div style={{ height: topPadding }} />}
        
        {/* Visible alerts */}
        {visibleAlerts.map(alert => (
          <AlertItem
            key={alert.id}
            alert={alert}
            isAcknowledged={isAlertAcknowledged?.(alert.id) ?? false}
            severityColors={severityColors}
            onAlertClick={onAlertClick}
            onAcknowledge={onAcknowledge}
          />
        ))}
        
        {/* Bottom padding for virtualization */}
        {bottomPadding > 0 && <div style={{ height: bottomPadding }} />}
      </div>
    </ScrollArea>
  );
});

VirtualizedAlertList.displayName = 'VirtualizedAlertList';

export function AlertList({
  alerts,
  areas,
  onAlertClick,
  onAcknowledge,
  isAlertAcknowledged,
  className,
}: AlertListProps) {
  const [severityFilter, setSeverityFilter] = React.useState<string>('all')
  const [areaFilter, setAreaFilter] = React.useState<string>('all')

  // Filter alerts - optimized with useMemo
  const filteredAlerts = React.useMemo(() => {
    // Early return if no filters applied
    if (severityFilter === 'all' && areaFilter === 'all') {
      return alerts;
    }
    
    return alerts.filter(alert => {
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter
      const matchesArea = areaFilter === 'all' || alert.areaId === areaFilter
      return matchesSeverity && matchesArea
    })
  }, [alerts, severityFilter, areaFilter])

  const severityColors = {
    [ThresholdLevel.NORMAL]: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    [ThresholdLevel.WARNING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
    [ThresholdLevel.CRITICAL]: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200',
    [ThresholdLevel.EMERGENCY]: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  }

  const hasActiveFilters = severityFilter !== 'all' || areaFilter !== 'all'

  const clearFilters = () => {
    setSeverityFilter('all')
    setAreaFilter('all')
  }

  return (
    <Card className={cn('bg-card/50 border-border/50 backdrop-blur-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Recent Alerts
            </CardTitle>
            <CardDescription>
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} displayed
            </CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value={ThresholdLevel.EMERGENCY}>Emergency</SelectItem>
              <SelectItem value={ThresholdLevel.CRITICAL}>Critical</SelectItem>
              <SelectItem value={ThresholdLevel.WARNING}>Warning</SelectItem>
              <SelectItem value={ThresholdLevel.NORMAL}>Normal</SelectItem>
            </SelectContent>
          </Select>

          <Select value={areaFilter} onValueChange={setAreaFilter}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
              {areas.map(area => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No alerts to display</p>
            {hasActiveFilters && (
              <p className="text-xs mt-1">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          <VirtualizedAlertList
            alerts={filteredAlerts}
            isAlertAcknowledged={isAlertAcknowledged}
            severityColors={severityColors}
            onAlertClick={onAlertClick}
            onAcknowledge={onAcknowledge}
          />
        )}
      </CardContent>
    </Card>
  )
}
