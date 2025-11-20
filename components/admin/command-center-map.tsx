/**
 * Command Center Live Map Component
 * 
 * Interactive SVG-based venue map with real-time crowd density visualization.
 * Features zoom/pan capabilities, zone selection, and alert highlighting.
 */

'use client';

import { useState, useRef, useCallback, useMemo, memo } from 'react';
import { Zone } from '@/lib/types/command-center';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface LiveMapProps {
  zones: Zone[];
  selectedZone: string | null;
  onZoneSelect: (zoneId: string) => void;
  highlightedZones?: string[]; // For alert highlighting
}

/**
 * Get color class based on density level
 */
function getDensityColor(densityLevel: Zone['densityLevel']): string {
  switch (densityLevel) {
    case 'low':
      return 'fill-green-500 hover:fill-green-600';
    case 'medium':
      return 'fill-yellow-500 hover:fill-yellow-600';
    case 'high':
      return 'fill-orange-500 hover:fill-orange-600';
    case 'critical':
      return 'fill-red-600 hover:fill-red-700';
    default:
      return 'fill-gray-500 hover:fill-gray-600';
  }
}

/**
 * Get stroke color for selected/highlighted zones
 */
function getStrokeColor(isSelected: boolean, isHighlighted: boolean): string {
  if (isSelected) return 'stroke-blue-500';
  if (isHighlighted) return 'stroke-red-500';
  return 'stroke-slate-700';
}

function CommandCenterMap({
  zones,
  selectedZone,
  onZoneSelect,
  highlightedZones = [],
}: LiveMapProps) {
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate SVG viewBox based on zone coordinates
  const viewBox = useMemo(() => {
    if (zones.length === 0) return '0 0 1000 800';
    
    // Find bounds of all zones
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    zones.forEach(zone => {
      const { x, y, width, height } = zone.coordinates;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    return `${minX} ${minY} ${width} ${height}`;
  }, [zones]);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  }, []);

  // Handle pan start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) { // Left mouse button
      setIsPanning(true);
      setPanStart({ x: e.clientX - translateX, y: e.clientY - translateY });
    }
  }, [translateX, translateY]);

  // Handle pan move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTranslateX(e.clientX - panStart.x);
      setTranslateY(e.clientY - panStart.y);
    }
  }, [isPanning, panStart]);

  // Handle pan end
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle zone click
  const handleZoneClick = useCallback((zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onZoneSelect(zoneId);
  }, [onZoneSelect]);

  // Reset zoom and pan
  const handleReset = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden border border-primary/20" role="region" aria-label="Interactive venue map">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2" role="toolbar" aria-label="Map controls">
        <button
          onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
          className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-lg p-2 hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
          className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-lg p-2 hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-lg p-2 hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Reset view"
          title="Reset view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-primary/30" role="legend" aria-label="Map legend">
        <div className="text-xs font-bold text-foreground mb-2">Density Levels</div>
        <ul className="space-y-1 text-xs" role="list">
          <li className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" aria-hidden="true" />
            <span className="text-muted-foreground">Low</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" aria-hidden="true" />
            <span className="text-muted-foreground">Medium</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500" aria-hidden="true" />
            <span className="text-muted-foreground">High</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-600" aria-hidden="true" />
            <span className="text-muted-foreground">Critical</span>
          </li>
        </ul>
      </div>

      {/* SVG Map */}
      <TooltipProvider>
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          viewBox={viewBox}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          role="img"
          aria-label={`Venue map showing ${zones.length} zones with real-time crowd density`}
          style={{
            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Render zones */}
          {zones.map(zone => {
            const isSelected = selectedZone === zone.id;
            const isHighlighted = highlightedZones.includes(zone.id);
            const occupancyPercent = Math.round((zone.currentOccupancy / zone.maxCapacity) * 100);

            return (
              <Tooltip key={zone.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={(e) => handleZoneClick(zone.id, e)}
                    className="cursor-pointer transition-all duration-300"
                    style={{ transformOrigin: 'center' }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${zone.name}: ${occupancyPercent}% occupied, ${zone.densityLevel} density`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleZoneClick(zone.id, e as any);
                      }
                    }}
                  >
                    {/* Zone rectangle */}
                    <rect
                      x={zone.coordinates.x}
                      y={zone.coordinates.y}
                      width={zone.coordinates.width}
                      height={zone.coordinates.height}
                      className={`
                        ${getDensityColor(zone.densityLevel)}
                        ${getStrokeColor(isSelected, isHighlighted)}
                        transition-all duration-300
                        ${isSelected ? 'stroke-[4]' : 'stroke-[2]'}
                        ${isHighlighted ? 'animate-pulse' : ''}
                      `}
                      opacity={isSelected ? 0.9 : 0.7}
                      rx="4"
                      aria-hidden="true"
                    />

                    {/* Zone label */}
                    <text
                      x={zone.coordinates.x + zone.coordinates.width / 2}
                      y={zone.coordinates.y + zone.coordinates.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white font-semibold text-sm pointer-events-none select-none"
                      style={{ fontSize: '14px' }}
                      aria-hidden="true"
                    >
                      {zone.name}
                    </text>

                    {/* Occupancy percentage */}
                    <text
                      x={zone.coordinates.x + zone.coordinates.width / 2}
                      y={zone.coordinates.y + zone.coordinates.height / 2 + 20}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white/80 text-xs pointer-events-none select-none"
                      style={{ fontSize: '12px' }}
                      aria-hidden="true"
                    >
                      {occupancyPercent}%
                    </text>

                    {/* Alert indicator for highlighted zones */}
                    {isHighlighted && (
                      <circle
                        cx={zone.coordinates.x + zone.coordinates.width - 15}
                        cy={zone.coordinates.y + 15}
                        r="8"
                        className="fill-red-600 animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-card/95 border-primary/50">
                  <div className="text-sm">
                    <div className="font-bold">{zone.name}</div>
                    <div className="text-muted-foreground">
                      Occupancy: {zone.currentOccupancy} / {zone.maxCapacity}
                    </div>
                    <div className="text-muted-foreground">
                      Density: {zone.densityLevel}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(zone.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>
      </TooltipProvider>

      {/* Empty state */}
      {zones.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm">No zones available</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(CommandCenterMap);
