'use client';

/**
 * Route Details Component
 * 
 * Step-by-step route guidance display with accessibility features,
 * estimated times with mobility adjustments, and amenity information.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { OptimizedRoute, PathSegment, Amenity } from '@/lib/types/route-optimization';
import { 
  ArrowRight,
  Clock,
  Ruler,
  TrendingUp,
  Accessibility,
  Users,
  MapPin,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface RouteDetailsProps {
  route: OptimizedRoute;
  showAccessibilityDetails?: boolean;
}

/**
 * Get amenity display name
 */
function getAmenityName(type: Amenity['type']): string {
  const names: Record<Amenity['type'], string> = {
    'restroom': 'Restroom',
    'seating': 'Seating Area',
    'water': 'Water Station',
    'assistance-point': 'Assistance Point',
    'medical': 'Medical Facility',
  };
  return names[type];
}

/**
 * Get amenity icon
 */
function getAmenityIcon(type: Amenity['type']): string {
  const icons: Record<Amenity['type'], string> = {
    'restroom': '🚻',
    'seating': '🪑',
    'water': '💧',
    'assistance-point': '🆘',
    'medical': '⚕️',
  };
  return icons[type];
}

/**
 * Format distance
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

/**
 * Segment Detail Card
 */
function SegmentDetail({ 
  segment, 
  index, 
  showAccessibilityDetails 
}: { 
  segment: PathSegment; 
  index: number;
  showAccessibilityDetails: boolean;
}) {
  const { accessibility, amenities, isWomenOnly } = segment;
  
  return (
    <article className="space-y-3" aria-labelledby={`segment-${index}-title`}>
      {/* Segment Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold" aria-hidden="true">
          {index + 1}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 id={`segment-${index}-title`} className="font-semibold">Step {index + 1}</h3>
            
            {accessibility.wheelchairAccessible && (
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
          
          {/* Basic Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Ruler className="w-4 h-4" />
              {formatDistance(segment.distance)}
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {segment.estimatedTime} min
            </div>
            
            {accessibility.maxIncline > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {accessibility.maxIncline}° incline
              </div>
            )}
          </div>
          
          {/* Accessibility Details */}
          {showAccessibilityDetails && (
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                Accessibility Features
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {accessibility.hasStairs ? (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span>{accessibility.hasStairs ? 'Has stairs' : 'No stairs'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {accessibility.hasHandrails ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Info className="w-4 h-4 text-gray-400" />
                  )}
                  <span>{accessibility.hasHandrails ? 'Handrails' : 'No handrails'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {accessibility.minWidth >= 1.5 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span>Width: {accessibility.minWidth}m</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {accessibility.maxIncline <= 5 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span>Max incline: {accessibility.maxIncline}°</span>
                </div>
                
                <div className="flex items-center gap-2 col-span-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>Surface: {accessibility.surfaceType}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Amenities */}
          {amenities.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                Nearby Facilities
              </div>
              
              <ul className="space-y-1" aria-label="Nearby facilities">
                {amenities.map((amenity, idx) => (
                  <li 
                    key={idx}
                    className="flex items-center gap-2 text-sm p-2 bg-background border rounded"
                  >
                    <span className="text-lg" role="img" aria-label={getAmenityName(amenity.type)}>{getAmenityIcon(amenity.type)}</span>
                    <span className="flex-1">{getAmenityName(amenity.type)}</span>
                    <span className="text-xs text-muted-foreground">
                      {amenity.distanceFromPath}m away
                    </span>
                    {amenity.accessible && (
                      <Badge variant="outline" className="text-xs">
                        <Accessibility className="w-3 h-3 mr-1" aria-hidden="true" />
                        <span>Accessible</span>
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Coordinates */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" aria-hidden="true" />
              <span>From: {segment.startPoint.latitude.toFixed(4)}, {segment.startPoint.longitude.toFixed(4)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
              <span>To: {segment.endPoint.latitude.toFixed(4)}, {segment.endPoint.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Route Details Component
 */
export function RouteDetails({ 
  route, 
  showAccessibilityDetails = true 
}: RouteDetailsProps) {
  // Calculate cumulative times and distances
  const cumulativeData = route.segments.reduce((acc, segment, index) => {
    const prevTime = index > 0 ? acc[index - 1].time : 0;
    const prevDistance = index > 0 ? acc[index - 1].distance : 0;
    
    acc.push({
      time: prevTime + segment.estimatedTime,
      distance: prevDistance + segment.distance,
    });
    
    return acc;
  }, [] as Array<{ time: number; distance: number }>);
  
  // Get accessible entry/exit points
  const entryPoint = route.segments[0]?.startPoint;
  const exitPoint = route.segments[route.segments.length - 1]?.endPoint;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Details</CardTitle>
        <CardDescription>
          Step-by-step guidance for your accessible route
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Entry Point */}
        {entryPoint && (
          <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg" role="region" aria-label="Accessible entry point">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center" aria-hidden="true">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-green-900">Accessible Entry Point</div>
                <div className="text-sm text-green-700">
                  Start your journey here
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {entryPoint.latitude.toFixed(4)}, {entryPoint.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Route Segments */}
        <nav className="space-y-6" aria-label="Route step-by-step guidance">
          {route.segments.map((segment, index) => (
            <div key={segment.id}>
              <SegmentDetail 
                segment={segment} 
                index={index}
                showAccessibilityDetails={showAccessibilityDetails}
              />
              
              {/* Progress Indicator */}
              {index < route.segments.length - 1 && (
                <div className="flex items-center gap-3 my-4 ml-5" aria-label={`Progress after step ${index + 1}`}>
                  <div className="w-px h-8 bg-border" aria-hidden="true" />
                  <div className="text-xs text-muted-foreground">
                    Cumulative: {Math.round(cumulativeData[index].time)} min • {formatDistance(cumulativeData[index].distance)}
                  </div>
                </div>
              )}
              
              {index < route.segments.length - 1 && <Separator className="my-4" aria-hidden="true" />}
            </div>
          ))}
        </nav>
        
        {/* Exit Point */}
        {exitPoint && (
          <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg" role="region" aria-label="Accessible exit point">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center" aria-hidden="true">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">Accessible Exit Point</div>
                <div className="text-sm text-blue-700">
                  You've reached your destination
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {exitPoint.latitude.toFixed(4)}, {exitPoint.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="p-4 bg-muted rounded-lg space-y-2" role="region" aria-label="Route summary">
          <h3 className="font-semibold">Route Summary</h3>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Total Time</dt>
              <dd className="font-semibold">{Math.round(route.estimatedDuration)} min</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total Distance</dt>
              <dd className="font-semibold">{formatDistance(route.totalDistance)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Segments</dt>
              <dd className="font-semibold">{route.segments.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Facilities</dt>
              <dd className="font-semibold">{route.amenitiesCount}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  );
}
