'use client';

/**
 * Accessible Routes Page
 * 
 * This page allows pilgrims to request and view optimized accessible routes
 * based on their accessibility profile and preferences.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccessibleRouteMap } from '@/components/routes/accessible-route-map';
import { RouteDetails } from '@/components/routes/route-details';
import { AccessibilityBadges } from '@/components/accessibility/badges';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getProfile } from '@/lib/services/accessibility-service';
import { 
  calculateRoute, 
  type RouteCalculationOptions 
} from '@/lib/services/route-optimizer-service';
import { MOCK_LOCATIONS } from '@/lib/mock-data/path-segments-mock';
import { 
  handleAccessibilityError, 
  handleAccessibilityWarning,
  AccessibilityErrorType 
} from '@/lib/utils/error-handler';
import { LoadingSpinner } from '@/components/ui/loading-state';
import type { OptimizedRoute } from '@/lib/types/route-optimization';
import type { AccessibilityProfile } from '@/lib/types/accessibility';
import { 
  Navigation, 
  RefreshCw, 
  MapPin, 
  Info,
  Loader2
} from 'lucide-react';

export default function RoutesPage() {
  const [profile, setProfile] = useState<AccessibilityProfile | null>(null);
  const [route, setRoute] = useState<OptimizedRoute | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<OptimizedRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferWomenOnly, setPreferWomenOnly] = useState(false);
  const [includeAlternatives, setIncludeAlternatives] = useState(true);
  const [lastCalculationTime, setLastCalculationTime] = useState<Date | null>(null);

  // Load accessibility profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const pilgrimId = 'pilgrim-001'; // In real app, get from auth context
      const userProfile = await getProfile(pilgrimId);
      
      if (userProfile) {
        setProfile(userProfile);
        
        // Auto-enable women-only preference if in profile
        if (userProfile.categories.includes('women-only-route')) {
          setPreferWomenOnly(true);
        }
      }
    };
    
    loadProfile();
  }, []);

  /**
   * Calculate route based on current settings
   */
  const handleCalculateRoute = () => {
    if (!profile) {
      handleAccessibilityWarning(
        'Profile Required',
        'Please set up your accessibility profile first to get personalized routes.'
      );
      setError('Please set up your accessibility profile first');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedAlternative(null);

    try {
      // Use mock locations for demo
      const options: RouteCalculationOptions = {
        startPoint: MOCK_LOCATIONS.mainEntrance,
        endPoint: MOCK_LOCATIONS.templeMain,
        accessibilityProfile: profile,
        preferWomenOnly,
        includeAlternatives,
      };

      const calculatedRoute = calculateRoute(options);

      if (calculatedRoute) {
        setRoute(calculatedRoute);
        setLastCalculationTime(new Date());
      } else {
        handleAccessibilityError(
          AccessibilityErrorType.ROUTE_CALCULATION_ERROR,
          new Error('No suitable route found'),
          { options }
        );
        setError('Unable to find a suitable route. Please try different options.');
      }
    } catch (err) {
      handleAccessibilityError(
        AccessibilityErrorType.ROUTE_CALCULATION_ERROR,
        err,
        { options: { preferWomenOnly, includeAlternatives } }
      );
      setError('An error occurred while calculating the route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recalculate route (with 2-minute constraint)
   */
  const handleRecalculateRoute = () => {
    if (!profile) return;

    // Check if 2 minutes have passed
    if (lastCalculationTime) {
      const timeSinceLastCalc = Date.now() - lastCalculationTime.getTime();
      if (timeSinceLastCalc < 120000) {
        const remainingSeconds = Math.ceil((120000 - timeSinceLastCalc) / 1000);
        setError(`Please wait ${remainingSeconds} seconds before recalculating the route.`);
        return;
      }
    }

    handleCalculateRoute();
  };

  /**
   * Select an alternative route
   */
  const handleSelectAlternative = (index: number) => {
    if (route && route.alternativeRoutes[index]) {
      setSelectedAlternative(route.alternativeRoutes[index].route);
    }
  };

  // Determine which route to display
  const displayRoute = selectedAlternative || route;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Navigation className="w-8 h-8" />
          Accessible Routes
        </h1>
        <p className="text-muted-foreground">
          Get personalized route guidance based on your accessibility needs
        </p>
      </div>

      {/* Profile Info */}
      {profile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Your Accessibility Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <AccessibilityBadges categories={profile.categories} />
            <p className="text-sm text-muted-foreground mt-2">
              Routes are optimized for your mobility needs
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Profile Warning */}
      {!profile && (
        <Alert className="mb-6">
          <Info className="w-4 h-4" />
          <AlertDescription>
            Please set up your accessibility profile to get personalized route recommendations.
            <Button variant="link" className="ml-2 p-0 h-auto" asChild>
              <a href="/profile">Go to Profile</a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Route Request Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Route Options</CardTitle>
          <CardDescription>
            Customize your route preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Points Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Start Point
              </Label>
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                Main Entrance
                <div className="text-xs mt-1">
                  {MOCK_LOCATIONS.mainEntrance.latitude.toFixed(4)}, {MOCK_LOCATIONS.mainEntrance.longitude.toFixed(4)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Destination
              </Label>
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
                Temple Main
                <div className="text-xs mt-1">
                  {MOCK_LOCATIONS.templeMain.latitude.toFixed(4)}, {MOCK_LOCATIONS.templeMain.longitude.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="women-only">Prefer Women-Only Routes</Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize routes through designated women-only zones
                </p>
              </div>
              <Switch
                id="women-only"
                checked={preferWomenOnly}
                onCheckedChange={setPreferWomenOnly}
                disabled={!profile}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alternatives">Show Alternative Routes</Label>
                <p className="text-sm text-muted-foreground">
                  Display other route options you might consider
                </p>
              </div>
              <Switch
                id="alternatives"
                checked={includeAlternatives}
                onCheckedChange={setIncludeAlternatives}
                disabled={!profile}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleCalculateRoute}
              disabled={!profile || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Calculate Route
                </>
              )}
            </Button>

            {route && (
              <Button 
                onClick={handleRecalculateRoute}
                disabled={!profile || loading}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recalculate
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Route Display */}
      {displayRoute && (
        <div className="space-y-6">
          {/* Alternative Route Notice */}
          {selectedAlternative && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Viewing alternative route. 
                <Button 
                  variant="link" 
                  className="ml-2 p-0 h-auto"
                  onClick={() => setSelectedAlternative(null)}
                >
                  View primary route
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Route Tabs */}
          <Tabs defaultValue="map" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map">Map View</TabsTrigger>
              <TabsTrigger value="details">Step-by-Step</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="mt-6">
              <AccessibleRouteMap 
                route={displayRoute}
                onAlternativeSelect={handleSelectAlternative}
                showAlternatives={includeAlternatives && !selectedAlternative}
              />
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <RouteDetails 
                route={displayRoute}
                showAccessibilityDetails={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Empty State */}
      {/* Loading State */}
      {loading && <LoadingSpinner message="Calculating accessible route..." />}

      {/* Empty State */}
      {!route && !loading && profile && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Navigation className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Route Calculated</h3>
            <p className="text-muted-foreground text-center mb-4">
              Click "Calculate Route" to get your personalized accessible route
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
