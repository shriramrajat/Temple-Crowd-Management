/**
 * Command Center High-Density Warning Component
 * 
 * Displays prominent warnings when crowd density exceeds safety thresholds.
 * Features pulsing animations, density indicators, and zone highlighting coordination.
 */

'use client';

import { useCallback, useMemo, memo } from 'react';
import { HighDensityWarning } from '@/lib/types/command-center';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle,
  Users,
  TrendingUp,
  MapPin,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HighDensityWarningsProps {
  warnings: HighDensityWarning[];
  onWarningClick?: (warning: HighDensityWarning) => void;
  onWarningDismiss?: (warningId: string) => void;
}

/**
 * Format density as percentage
 */
function formatDensity(density: number): string {
  return `${Math.round(density * 100)}%`;
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

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else {
    return date.toLocaleTimeString();
  }
}

function CommandCenterWarnings({
  warnings,
  onWarningClick,
  onWarningDismiss,
}: HighDensityWarningsProps) {
  // Filter only active warnings - memoized to prevent recalculation
  const activeWarnings = useMemo(() => {
    return warnings.filter(w => w.status === 'active');
  }, [warnings]);

  // Handle warning click
  const handleWarningClick = useCallback((warning: HighDensityWarning) => {
    if (onWarningClick) {
      onWarningClick(warning);
    }
  }, [onWarningClick]);

  // Handle warning dismiss
  const handleDismiss = useCallback((warningId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWarningDismiss) {
      onWarningDismiss(warningId);
    }
  }, [onWarningDismiss]);

  // Don't render if no active warnings
  if (activeWarnings.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" role="alert" aria-live="assertive" aria-atomic="false">
      {activeWarnings.map((warning) => {
        // Memoize calculations per warning
        const densityPercentage = warning.currentDensity * 100;
        const thresholdPercentage = warning.threshold * 100;
        const exceedancePercentage = densityPercentage - thresholdPercentage;

        return (
          <div
            key={warning.id}
            onClick={() => handleWarningClick(warning)}
            role="alertdialog"
            tabIndex={0}
            aria-label={`High density warning: ${warning.zoneName} at ${formatDensity(warning.currentDensity)} density, exceeding threshold of ${formatDensity(warning.threshold)}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleWarningClick(warning);
              }
            }}
            className={cn(
              "relative overflow-hidden rounded-lg border-2 cursor-pointer",
              "bg-gradient-to-br from-red-50 to-orange-50",
              "dark:from-red-950/30 dark:to-orange-950/30",
              "border-red-500 dark:border-red-600",
              "shadow-lg hover:shadow-xl transition-all duration-300",
              "hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
              // Pulsing animation
              "animate-pulse-slow"
            )}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 animate-gradient-x" aria-hidden="true" />
            
            {/* Content */}
            <div className="relative p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 p-2 rounded-full bg-red-500 text-white animate-pulse" aria-hidden="true">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                      High Density Warning
                    </h3>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                      {formatRelativeTime(warning.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Dismiss button */}
                {onWarningDismiss && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDismiss(warning.id, e)}
                    className="flex-shrink-0 h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                    aria-label={`Dismiss warning for ${warning.zoneName}`}
                    title="Dismiss warning"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                )}
              </div>

              {/* Zone information */}
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                <span className="font-semibold text-red-900 dark:text-red-300">
                  {warning.zoneName}
                </span>
                <Badge variant="destructive" className="ml-auto" aria-label="Critical severity">
                  CRITICAL
                </Badge>
              </div>

              {/* Density metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Current density */}
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-red-200 dark:border-red-800" role="status" aria-label={`Current density: ${formatDensity(warning.currentDensity)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">
                      Current Density
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                    {formatDensity(warning.currentDensity)}
                  </p>
                </div>

                {/* Threshold */}
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800" role="status" aria-label={`Threshold: ${formatDensity(warning.threshold)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                      Threshold
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                    {formatDensity(warning.threshold)}
                  </p>
                </div>
              </div>

              {/* Exceedance indicator */}
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 border border-red-300 dark:border-red-700" role="status" aria-label={`Exceeds threshold by ${formatDensity(exceedancePercentage / 100)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-red-900 dark:text-red-300">
                    Exceeds threshold by
                  </span>
                  <span className="text-lg font-bold text-red-700 dark:text-red-400">
                    {formatDensity(exceedancePercentage / 100)}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="relative h-2 bg-red-200 dark:bg-red-900/50 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.min(100, (exceedancePercentage / 50) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Exceedance level">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse"
                    style={{ width: `${Math.min(100, (exceedancePercentage / 50) * 100)}%` }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Action hint */}
              <div className="mt-3 text-xs text-red-600/80 dark:text-red-400/80 text-center" aria-hidden="true">
                Click to view zone on map
              </div>
            </div>

            {/* Flashing border effect */}
            <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-flash pointer-events-none" aria-hidden="true" />
          </div>
        );
      })}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommandCenterWarnings);
