/**
 * Command Center Alert System Component
 * 
 * Real-time alert display and management panel for the Admin Command Center Dashboard.
 * Features scrollable alert list, severity indicators, and interactive alert management.
 */

'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Alert, AlertSeverity } from '@/lib/types/command-center';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Check,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface AlertSystemProps {
  alerts: Alert[];
  maxAlerts?: number;
  onAlertClick?: (alert: Alert) => void;
  onAlertAcknowledge?: (alertId: string) => void;
}

/**
 * Get severity icon component
 */
function getSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-4 h-4" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4" />;
    case 'info':
      return <Info className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

/**
 * Get severity color classes
 */
function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'critical':
      return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900';
    case 'warning':
      return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-900';
    case 'info':
      return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-900';
  }
}

/**
 * Get severity badge variant
 */
function getSeverityBadgeVariant(severity: AlertSeverity): 'default' | 'destructive' | 'outline' | 'secondary' {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'warning':
      return 'default';
    case 'info':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
  }
}

function CommandCenterAlerts({
  alerts,
  maxAlerts = 50,
  onAlertClick,
  onAlertAcknowledge,
}: AlertSystemProps) {
  const [severityFilter, setSeverityFilter] = useState<Set<AlertSeverity>>(
    new Set(['critical', 'warning', 'info'])
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousAlertsLengthRef = useRef(alerts.length);

  // Filter alerts by severity - memoized to prevent recalculation
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => severityFilter.has(alert.severity))
      .slice(0, maxAlerts);
  }, [alerts, severityFilter, maxAlerts]);

  // Auto-scroll to new alerts
  useEffect(() => {
    if (alerts.length > previousAlertsLengthRef.current) {
      // New alert added, scroll to top
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    previousAlertsLengthRef.current = alerts.length;
  }, [alerts.length]);

  // Toggle severity filter
  const toggleSeverityFilter = useCallback((severity: AlertSeverity) => {
    setSeverityFilter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(severity)) {
        newSet.delete(severity);
      } else {
        newSet.add(severity);
      }
      return newSet;
    });
  }, []);

  // Handle alert click
  const handleAlertClick = useCallback((alert: Alert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    }
  }, [onAlertClick]);

  // Handle alert acknowledgment
  const handleAcknowledge = useCallback((alertId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAlertAcknowledge) {
      onAlertAcknowledge(alertId);
    }
  }, [onAlertAcknowledge]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-primary/20" role="region" aria-label="Alert system">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Alerts</h2>
          <Badge variant="secondary" className="ml-2" aria-label={`${filteredAlerts.length} alerts`}>
            {filteredAlerts.length}
          </Badge>
        </div>

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2" aria-label="Filter alerts by severity">
              <Filter className="w-4 h-4" aria-hidden="true" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" aria-label="Alert severity filters">
            <DropdownMenuCheckboxItem
              checked={severityFilter.has('critical')}
              onCheckedChange={() => toggleSeverityFilter('critical')}
              aria-label="Show critical alerts"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" aria-hidden="true" />
                Critical
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={severityFilter.has('warning')}
              onCheckedChange={() => toggleSeverityFilter('warning')}
              aria-label="Show warning alerts"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" aria-hidden="true" />
                Warning
              </div>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={severityFilter.has('info')}
              onCheckedChange={() => toggleSeverityFilter('info')}
              aria-label="Show info alerts"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" aria-hidden="true" />
                Info
              </div>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alert list */}
      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="p-4 space-y-3" role="log" aria-live="polite" aria-atomic="false" aria-relevant="additions">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Check className="w-6 h-6 text-muted-foreground" aria-hidden="true" />
              </div>
              <p className="text-sm text-muted-foreground">No alerts to display</p>
              <p className="text-xs text-muted-foreground mt-1">
                {severityFilter.size < 3 ? 'Try adjusting your filters' : 'All systems operational'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                role="article"
                tabIndex={0}
                aria-label={`${alert.severity} alert: ${alert.message} in ${alert.zoneName}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAlertClick(alert);
                  }
                }}
                className={`
                  relative p-4 rounded-lg border-2 transition-all cursor-pointer
                  hover:shadow-md hover:scale-[1.02]
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                  ${getSeverityColor(alert.severity)}
                  ${alert.acknowledged ? 'opacity-60' : ''}
                `}
              >
                {/* Alert header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Severity icon */}
                    <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
                      {getSeverityIcon(alert.severity)}
                    </div>

                    {/* Alert info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant={getSeverityBadgeVariant(alert.severity)}
                          className="text-xs"
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium mb-1 break-words">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs opacity-75">
                        <span className="font-medium">{alert.zoneName}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acknowledge button */}
                  {!alert.acknowledged && onAlertAcknowledge && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      className="flex-shrink-0 h-8 w-8 p-0"
                      aria-label={`Acknowledge ${alert.severity} alert for ${alert.zoneName}`}
                      title="Acknowledge alert"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  )}

                  {alert.acknowledged && (
                    <div className="flex-shrink-0 text-xs opacity-75 flex items-center gap-1" aria-label="Alert acknowledged">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      <span>Ack</span>
                    </div>
                  )}
                </div>

                {/* Timestamp tooltip */}
                <div className="text-xs opacity-50 mt-2">
                  {alert.timestamp.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with alert count */}
      {filteredAlerts.length > 0 && (
        <div className="p-3 border-t border-primary/20 text-xs text-muted-foreground text-center">
          Showing {filteredAlerts.length} of {alerts.length} alerts
          {alerts.length >= maxAlerts && ` (max ${maxAlerts})`}
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommandCenterAlerts);
