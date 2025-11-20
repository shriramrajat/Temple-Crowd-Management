/**
 * Command Center Zone Status Component
 * 
 * Comprehensive zone status overview with sortable table for the Admin Command Center Dashboard.
 * Features real-time status updates, occupancy visualization, and interactive zone selection.
 */

'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Zone } from '@/lib/types/command-center';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  AlertTriangle,
  Users,
  MapPin
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface ZoneStatusProps {
  zones: Zone[];
  onZoneClick?: (zoneId: string) => void;
  selectedZoneId?: string | null;
  sortBy?: 'name' | 'occupancy' | 'capacity';
}

type SortField = 'name' | 'occupancy' | 'capacity' | 'percentage';
type SortDirection = 'asc' | 'desc';

/**
 * Get density level color for progress bar (CSS variable)
 */
function getDensityColor(percentage: number): string {
  if (percentage >= 90) return 'hsl(0 84.2% 60.2%)'; // red
  if (percentage >= 80) return 'hsl(24.6 95% 53.1%)'; // orange
  if (percentage >= 60) return 'hsl(47.9 95.8% 53.1%)'; // yellow
  return 'hsl(142.1 76.2% 36.3%)'; // green
}

/**
 * Get density level badge variant
 */
function getDensityBadgeVariant(percentage: number): 'default' | 'destructive' | 'outline' | 'secondary' {
  if (percentage >= 90) return 'destructive';
  if (percentage >= 80) return 'default';
  return 'secondary';
}

function CommandCenterZones({
  zones,
  onZoneClick,
  selectedZoneId,
  sortBy: initialSortBy = 'name',
}: ZoneStatusProps) {
  const [sortField, setSortField] = useState<SortField>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calculate occupancy percentage for each zone
  const zonesWithPercentage = useMemo(() => {
    return zones.map(zone => ({
      ...zone,
      percentage: Math.round((zone.currentOccupancy / zone.maxCapacity) * 100),
      isWarning: (zone.currentOccupancy / zone.maxCapacity) >= 0.8,
    }));
  }, [zones]);

  // Sort zones based on current sort field and direction
  const sortedZones = useMemo(() => {
    const sorted = [...zonesWithPercentage].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'occupancy':
          comparison = a.currentOccupancy - b.currentOccupancy;
          break;
        case 'capacity':
          comparison = a.maxCapacity - b.maxCapacity;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [zonesWithPercentage, sortField, sortDirection]);

  // Handle column header click for sorting
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Handle zone row click
  const handleZoneClick = useCallback((zoneId: string) => {
    if (onZoneClick) {
      onZoneClick(zoneId);
    }
  }, [onZoneClick]);

  // Render sort icon for column headers - memoized to prevent recalculation
  const renderSortIcon = useCallback((field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  }, [sortField, sortDirection]);
  
  // Memoize total occupancy and capacity calculations
  const totalStats = useMemo(() => {
    return {
      totalOccupancy: zones.reduce((sum, z) => sum + z.currentOccupancy, 0),
      totalCapacity: zones.reduce((sum, z) => sum + z.maxCapacity, 0),
      warningCount: zonesWithPercentage.filter(z => z.isWarning).length,
    };
  }, [zones, zonesWithPercentage]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border border-primary/20" role="region" aria-label="Zone status overview">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Zone Status</h2>
          <Badge variant="secondary" className="ml-2" aria-label={`${zones.length} zones`}>
            {zones.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-label={`Total occupancy: ${totalStats.totalOccupancy} of ${totalStats.totalCapacity}`}>
          <Users className="w-4 h-4" aria-hidden="true" />
          <span>
            {totalStats.totalOccupancy} / {totalStats.totalCapacity}
          </span>
        </div>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 font-semibold"
                  aria-label={`Sort by zone name ${sortField === 'name' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
                >
                  Zone Name
                  {renderSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('occupancy')}
                  className="flex items-center gap-1 font-semibold"
                  aria-label={`Sort by occupancy ${sortField === 'occupancy' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
                >
                  Occupancy
                  {renderSortIcon('occupancy')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('capacity')}
                  className="flex items-center gap-1 font-semibold"
                  aria-label={`Sort by capacity ${sortField === 'capacity' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
                >
                  Capacity
                  {renderSortIcon('capacity')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('percentage')}
                  className="flex items-center gap-1 font-semibold"
                  aria-label={`Sort by status ${sortField === 'percentage' ? (sortDirection === 'asc' ? 'descending' : 'ascending') : ''}`}
                >
                  Status
                  {renderSortIcon('percentage')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedZones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No zones available
                </TableCell>
              </TableRow>
            ) : (
              sortedZones.map((zone) => (
                <TableRow
                  key={zone.id}
                  onClick={() => handleZoneClick(zone.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${zone.name}: ${zone.percentage}% occupied, ${zone.currentOccupancy} of ${zone.maxCapacity} capacity${zone.isWarning ? ', at capacity warning' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleZoneClick(zone.id);
                    }
                  }}
                  className={`
                    cursor-pointer transition-colors
                    hover:bg-muted/50
                    focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                    ${selectedZoneId === zone.id ? 'bg-primary/10' : ''}
                  `}
                >
                  {/* Zone name */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {zone.name}
                      {zone.isWarning && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" aria-label="Capacity warning" />
                      )}
                    </div>
                  </TableCell>

                  {/* Current occupancy */}
                  <TableCell>
                    <span className="font-mono">{zone.currentOccupancy}</span>
                  </TableCell>

                  {/* Max capacity */}
                  <TableCell>
                    <span className="font-mono">{zone.maxCapacity}</span>
                  </TableCell>

                  {/* Status with progress bar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-[120px] relative" role="progressbar" aria-valuenow={zone.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.percentage}% occupied`}>
                        <div className="bg-primary/20 relative h-2 w-full overflow-hidden rounded-full">
                          <div 
                            className="h-full transition-all"
                            style={{ 
                              width: `${zone.percentage}%`,
                              backgroundColor: getDensityColor(zone.percentage)
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <Badge 
                        variant={getDensityBadgeVariant(zone.percentage)}
                        className="min-w-[50px] justify-center"
                        aria-label={`${zone.percentage} percent`}
                      >
                        {zone.percentage}%
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden flex-1 overflow-auto p-4 space-y-3">
        {sortedZones.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No zones available
          </div>
        ) : (
          sortedZones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone.id)}
              role="button"
              tabIndex={0}
              aria-label={`${zone.name}: ${zone.percentage}% occupied, ${zone.currentOccupancy} of ${zone.maxCapacity} capacity${zone.isWarning ? ', at capacity warning' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleZoneClick(zone.id);
                }
              }}
              className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                hover:shadow-md hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${selectedZoneId === zone.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-primary/20 bg-card'
                }
              `}
            >
              {/* Zone header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">{zone.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    <span className="font-mono">
                      {zone.currentOccupancy} / {zone.maxCapacity}
                    </span>
                  </div>
                </div>
                {zone.isWarning && (
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" aria-label="Capacity warning" />
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="bg-primary/20 relative h-3 w-full overflow-hidden rounded-full" role="progressbar" aria-valuenow={zone.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${zone.percentage}% occupied`}>
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${zone.percentage}%`,
                      backgroundColor: getDensityColor(zone.percentage)
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Occupancy
                  </span>
                  <Badge 
                    variant={getDensityBadgeVariant(zone.percentage)}
                    className="text-xs"
                    aria-label={`${zone.percentage} percent`}
                  >
                    {zone.percentage}%
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {sortedZones.length > 0 && (
        <div className="p-3 border-t border-primary/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {totalStats.warningCount} zones at capacity warning
            </span>
            <span>
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommandCenterZones);
