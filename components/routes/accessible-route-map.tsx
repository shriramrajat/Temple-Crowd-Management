'use client';

/**
 * Accessible Route Map Component
 * 
 * Interactive map interface for visualizing accessible routes with
 * color-coded accessibility indicators, women-only zones, and amenity markers.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OptimizedRoute, PathSegment, Amenity } from '@/lib/types/route-optimization';
import { 
  MapPin, 
  Navigation, 
  Accessibility, 
  Users, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface AccessibleRouteMapProps {
  route: OptimizedRoute;
  onAlternativeSelect?: (alternativeIndex: number) => void;
  showAlternatives?: boolean;
}

/**
 * Get color for accessibility score
 */
function getAccessibilityColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-orange-600';
}

/**
 * Get icon for amenity type
 */
function getAmenityIcon(type: Amenity['type']): React.ReactNode {
  switch (type) {
    case 'restroom':
      return '🚻';
    case 'seating':
      return '🪑';
    case 'water':
      return '💧';
    case 'assistance-point':
      return '🆘';
    case 'medical':
      return '⚕️';
    default:
      return '📍';
  }
}

/**
 * Render path segment on map
 */
function PathSegmentMarker({ segment, index }: { segment: PathSegment; index: number }) {
  const isAccessible = segment.accessibility.wheelchairAccessible;
  const isWomenOnly = segment.isWomenOnly;
  
  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent transition-colors">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        {index + 1}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            Segment {index + 1}
          </span>
          
          {isAccessible && (
            <Badge variant="outline" className="gap-1">
              <Accessibility className="w-3 h-3" />
              Accessible
            </Badge>
          )}
          
          {isWomenOnly && (
            <Badge variant="secondary" className="gap-1 bg-pink-100 text-pink-800 border-pink-200">
              <Users className="w-3 h-3" />
              Women-Only
            </Badge>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Distance: {segment.distance}m</div>
          <div>Est. Time: {segment.estimatedTime} min</div>
          {segment.accessibility.maxIncline > 0 && (
            <div>Incline: {segment.accessibility.maxIncline}°</div>
          )}
          {segment.amenities.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              <span>Amenities:</span>
              {segment.amenities.map((amenity, idx) => (
                <span key={idx} title={amenity.type}>
                  {getAmenityIcon(amenity.type)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Accessible Route Map Component
 */
export function AccessibleRouteMap({ 
  route, 
  onAlternativeSelect,
  showAlternatives = true 
}: AccessibleRouteMapProps) {
  return (
    <div className="space-y-4" role="region" aria-label="Accessible route map">
      {/* Route Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" aria-hidden="true" />
                <span>Optimized Route</span>
              </CardTitle>
              <CardDescription>
                {route.segments.length} segments • {route.totalDistance}m total
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div 
                className={`text-2xl font-bold ${getAccessibilityColor(route.accessibilityScore)}`}
                aria-label={`Accessibility score: ${route.accessibilityScore} out of 100`}
              >
                {route.accessibilityScore}
              </div>
              <div className="text-xs text-muted-foreground" aria-hidden="true">
                Accessibility Score
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Route Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Duration</div>
              <div className="text-lg font-semibold">
                {Math.round(route.estimatedDuration)} min
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Distance</div>
              <div className="text-lg font-semibold">
                {route.totalDistance}m
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Amenities</div>
              <div className="text-lg font-semibold">
                {route.amenitiesCount}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Type</div>
              <div className="text-lg font-semibold">
                {route.isWomenOnlyRoute ? (
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                    Women-Only
                  </Badge>
                ) : (
                  <Badge variant="outline">General</Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Route Indicators */}
          <div className="flex items-center gap-2 flex-wrap">
            {route.accessibilityScore >= 80 && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3" />
                Highly Accessible
              </Badge>
            )}
            
            {route.isWomenOnlyRoute && (
              <Badge variant="secondary" className="gap-1 bg-pink-100 text-pink-800 border-pink-200">
                <Users className="w-3 h-3" />
                Complete Women-Only Route
              </Badge>
            )}
            
            {route.amenitiesCount >= 3 && (
              <Badge variant="outline" className="gap-1">
                <Info className="w-3 h-3" />
                Multiple Facilities
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span>Route Map</span>
          </CardTitle>
          <CardDescription>
            Visual representation of your accessible route
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Simplified map visualization */}
          <nav className="space-y-3" aria-label="Route navigation">
            {/* Start Point */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-500 rounded-lg" role="region" aria-label="Starting point">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center" aria-hidden="true">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-green-900">Start Point</div>
                <div className="text-xs text-green-700">
                  {route.segments[0]?.startPoint.latitude.toFixed(4)}, {route.segments[0]?.startPoint.longitude.toFixed(4)}
                </div>
              </div>
            </div>
            
            {/* Path Segments */}
            <ol className="space-y-2 pl-4 border-l-2 border-dashed border-muted-foreground/30" aria-label="Route segments">
              {route.segments.map((segment, index) => (
                <li key={segment.id}>
                  <PathSegmentMarker segment={segment} index={index} />
                </li>
              ))}
            </ol>
            
            {/* End Point */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-500 rounded-lg" role="region" aria-label="Destination point">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center" aria-hidden="true">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">Destination</div>
                <div className="text-xs text-blue-700">
                  {route.segments[route.segments.length - 1]?.endPoint.latitude.toFixed(4)}, {route.segments[route.segments.length - 1]?.endPoint.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </nav>
        </CardContent>
      </Card>
      
      {/* Alternative Routes */}
      {showAlternatives && route.alternativeRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span>Alternative Routes</span>
            </CardTitle>
            <CardDescription>
              Other route options you might consider
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3" aria-label="Alternative route options">
              {route.alternativeRoutes.map((alt, index) => (
                <li 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">{alt.reason}</div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{Math.round(alt.route.estimatedDuration)} min</span>
                      <span>•</span>
                      <span>{alt.route.totalDistance}m</span>
                      <span>•</span>
                      <span className={getAccessibilityColor(alt.route.accessibilityScore)}>
                        Score: {alt.route.accessibilityScore}
                      </span>
                    </div>
                    
                    {alt.route.isWomenOnlyRoute && (
                      <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                        <Users className="w-3 h-3 mr-1" />
                        Women-Only Route
                      </Badge>
                    )}
                  </div>
                  
                  {onAlternativeSelect && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAlternativeSelect(index)}
                      aria-label={`Select alternative route: ${alt.reason}`}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </li>
            ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Map Legend</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-green-600" />
              <span>Wheelchair Accessible</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-600" />
              <span>Women-Only Zone</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🚻</span>
              <span>Restroom</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🪑</span>
              <span>Seating Area</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>💧</span>
              <span>Water Station</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>🆘</span>
              <span>Assistance Point</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
