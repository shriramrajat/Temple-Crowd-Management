/**
 * Admin Command Center Dashboard Page
 * 
 * Main dashboard page that integrates all command center components including
 * live map, alerts, footfall graph, zone status, and high-density warnings.
 */

'use client';

import { useState, useCallback } from 'react';
import { useCommandCenterData } from '@/hooks/use-command-center-data';
import CommandCenterMap from '@/components/admin/command-center-map';
import CommandCenterAlerts from '@/components/admin/command-center-alerts';
import CommandCenterFootfall from '@/components/admin/command-center-footfall';
import CommandCenterZones from '@/components/admin/command-center-zones';
import CommandCenterWarnings from '@/components/admin/command-center-warnings';
import { ErrorBoundary } from '@/components/error-boundary';
import { DashboardSkeleton } from '@/components/admin/command-center-skeleton';
import { TimeRange, Alert, HighDensityWarning } from '@/lib/types/command-center';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CommandCenterPage() {
  // Dashboard state
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('hourly');
  
  // Mobile collapsible sections state
  const [isMapOpen, setIsMapOpen] = useState(true);
  const [isAlertsOpen, setIsAlertsOpen] = useState(true);
  const [isFootfallOpen, setIsFootfallOpen] = useState(false);
  const [isZonesOpen, setIsZonesOpen] = useState(false);

  // Fetch real-time data
  const {
    zones,
    alerts,
    warnings,
    footfallData,
    connectionStatus,
    isLoading,
    error,
    refetch,
  } = useCommandCenterData({ timeRange });

  // Get zones that should be highlighted (from active warnings)
  const highlightedZones = warnings
    .filter(w => w.status === 'active')
    .map(w => w.zoneId);

  // Handle zone selection from map
  const handleZoneSelect = useCallback((zoneId: string) => {
    setSelectedZone(zoneId);
  }, []);

  // Handle alert click - highlight zone on map
  const handleAlertClick = useCallback((alert: Alert) => {
    setSelectedZone(alert.zoneId);
    // Optionally scroll to zone or show additional details
  }, []);

  // Handle warning click - highlight zone on map
  const handleWarningClick = useCallback((warning: HighDensityWarning) => {
    setSelectedZone(warning.zoneId);
    // Optionally trigger additional actions like opening zone details
  }, []);

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
  }, []);

  // Connection status indicator
  const connectionIndicator = (
    <div className="flex items-center gap-2">
      {connectionStatus === 'connected' && (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600">Connected</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <WifiOff className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-600">Disconnected</span>
        </>
      )}
      {connectionStatus === 'reconnecting' && (
        <>
          <RefreshCw className="w-4 h-4 text-orange-600 animate-spin" />
          <span className="text-sm text-orange-600">Reconnecting...</span>
        </>
      )}
    </div>
  );

  // Loading state - show skeleton during initial load
  if (isLoading && zones.length === 0) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error && !zones.length) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Failed to Load Dashboard</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            {error.message}
          </p>
          <Button onClick={refetch} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6" role="main" aria-label="Command Center Dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Command Center</h1>
          <p className="text-muted-foreground">
            Real-time venue monitoring and crowd management
          </p>
        </div>
        
        <div className="flex items-center gap-3" role="status" aria-live="polite">
          {connectionIndicator}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
            className="gap-2"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Warnings - Prominent display at top */}
      {warnings.length > 0 && (
        <ErrorBoundary>
          <div className="space-y-3" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-red-600">
                Active High-Density Warnings
              </h2>
              <Badge variant="destructive" className="ml-2" aria-label={`${warnings.filter(w => w.status === 'active').length} active warnings`}>
                {warnings.filter(w => w.status === 'active').length}
              </Badge>
            </div>
            <CommandCenterWarnings
              warnings={warnings}
              onWarningClick={handleWarningClick}
            />
          </div>
        </ErrorBoundary>
      )}

      {/* Main Dashboard Grid - Desktop & Tablet */}
      <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Map (2/3 width on desktop, full width on tablet) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Map */}
          <ErrorBoundary>
            <section className="h-[500px] lg:h-[600px]" aria-label="Live venue map">
              <CommandCenterMap
                zones={zones}
                selectedZone={selectedZone}
                onZoneSelect={handleZoneSelect}
                highlightedZones={highlightedZones}
              />
            </section>
          </ErrorBoundary>

          {/* Footfall Graph */}
          <ErrorBoundary>
            <section className="h-[400px]" aria-label="Footfall analytics">
              <CommandCenterFootfall
                zones={zones}
                zoneId={selectedZone}
                timeRange={timeRange}
                onTimeRangeChange={handleTimeRangeChange}
              />
            </section>
          </ErrorBoundary>
        </div>

        {/* Right Column - Alerts (1/3 width on desktop, full width on tablet) */}
        <div className="lg:col-span-1">
          <ErrorBoundary>
            <section className="h-[500px] lg:h-[1016px]" aria-label="Alert system">
              <CommandCenterAlerts
                alerts={alerts}
                onAlertClick={handleAlertClick}
              />
            </section>
          </ErrorBoundary>
        </div>
      </div>

      {/* Mobile Layout with Collapsible Sections */}
      <div className="md:hidden space-y-4">
        {/* Live Map Section */}
        <Collapsible open={isMapOpen} onOpenChange={setIsMapOpen}>
          <div className="bg-card rounded-lg border border-primary/20">
            <CollapsibleTrigger 
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              aria-expanded={isMapOpen}
              aria-controls="map-section"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Live Map
                {selectedZone && (
                  <Badge variant="secondary" className="text-xs" aria-label="Zone selected">
                    Zone Selected
                  </Badge>
                )}
              </h3>
              {isMapOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent id="map-section">
              <div className="p-4 pt-0">
                <ErrorBoundary>
                  <section className="h-[400px]" aria-label="Live venue map">
                    <CommandCenterMap
                      zones={zones}
                      selectedZone={selectedZone}
                      onZoneSelect={handleZoneSelect}
                      highlightedZones={highlightedZones}
                    />
                  </section>
                </ErrorBoundary>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Alerts Section */}
        <Collapsible open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
          <div className="bg-card rounded-lg border border-primary/20">
            <CollapsibleTrigger 
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              aria-expanded={isAlertsOpen}
              aria-controls="alerts-section"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Alerts
                <Badge variant="secondary" className="text-xs" aria-label={`${alerts.length} alerts`}>
                  {alerts.length}
                </Badge>
              </h3>
              {isAlertsOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent id="alerts-section">
              <div className="p-4 pt-0">
                <ErrorBoundary>
                  <section className="h-[400px]" aria-label="Alert system">
                    <CommandCenterAlerts
                      alerts={alerts}
                      onAlertClick={handleAlertClick}
                    />
                  </section>
                </ErrorBoundary>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Footfall Graph Section */}
        <Collapsible open={isFootfallOpen} onOpenChange={setIsFootfallOpen}>
          <div className="bg-card rounded-lg border border-primary/20">
            <CollapsibleTrigger 
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              aria-expanded={isFootfallOpen}
              aria-controls="footfall-section"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Footfall Analytics
                {selectedZone && (
                  <Badge variant="secondary" className="text-xs" aria-label="Filtered by zone">
                    Filtered
                  </Badge>
                )}
              </h3>
              {isFootfallOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent id="footfall-section">
              <div className="p-4 pt-0">
                <ErrorBoundary>
                  <section className="h-[400px]" aria-label="Footfall analytics">
                    <CommandCenterFootfall
                      zones={zones}
                      zoneId={selectedZone}
                      timeRange={timeRange}
                      onTimeRangeChange={handleTimeRangeChange}
                    />
                  </section>
                </ErrorBoundary>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Zone Status Section */}
        <Collapsible open={isZonesOpen} onOpenChange={setIsZonesOpen}>
          <div className="bg-card rounded-lg border border-primary/20">
            <CollapsibleTrigger 
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              aria-expanded={isZonesOpen}
              aria-controls="zones-section"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Zone Status
                <Badge variant="secondary" className="text-xs" aria-label={`${zones.length} zones`}>
                  {zones.length}
                </Badge>
              </h3>
              {isZonesOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent id="zones-section">
              <div className="p-4 pt-0">
                <ErrorBoundary>
                  <CommandCenterZones
                    zones={zones}
                    onZoneClick={handleZoneSelect}
                  />
                </ErrorBoundary>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>

      {/* Zone Status Table - Desktop & Tablet Only */}
      <section className="hidden md:block" aria-label="Zone status overview">
        <ErrorBoundary>
          <CommandCenterZones
            zones={zones}
            onZoneClick={handleZoneSelect}
          />
        </ErrorBoundary>
      </section>
    </div>
  );
}
