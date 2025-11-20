'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationFormProps {
  onSuccess?: () => void;
}

interface LocationData {
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string;
}

export function LocationForm({ onSuccess }: LocationFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState<LocationData>({
    country: 'India',
  });

  // Load existing location data
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const response = await fetch('/api/profile/location');
      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setLocationData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setLocationData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Not Supported',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding to get address from coordinates
          // Note: You'll need to add Google Maps API key to .env
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results[0]) {
              const result = data.results[0];
              const addressComponents = result.address_components;

              // Extract address components
              const getComponent = (type: string) => {
                const component = addressComponents.find((c: any) =>
                  c.types.includes(type)
                );
                return component?.long_name || '';
              };

              setLocationData({
                latitude,
                longitude,
                formattedAddress: result.formatted_address,
                placeId: result.place_id,
                address: result.formatted_address,
                city: getComponent('locality') || getComponent('administrative_area_level_2'),
                state: getComponent('administrative_area_level_1'),
                pinCode: getComponent('postal_code'),
                country: getComponent('country') || 'India',
              });

              toast({
                title: 'Location Retrieved',
                description: 'Your current location has been detected',
              });
            }
          } else {
            // Fallback: Just set coordinates without address
            setLocationData(prev => ({
              ...prev,
              latitude,
              longitude,
            }));

            toast({
              title: 'Location Retrieved',
              description: 'GPS coordinates captured. Please enter address manually.',
            });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          
          // Fallback: Just set coordinates
          setLocationData(prev => ({
            ...prev,
            latitude,
            longitude,
          }));

          toast({
            title: 'Location Retrieved',
            description: 'GPS coordinates captured. Please enter address manually.',
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: 'Location Error',
          description: error.message || 'Failed to get your location',
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update location');
      }

      toast({
        title: 'Success',
        description: 'Your location has been updated successfully',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update location',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Add your location details for easier booking and personalized recommendations.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 mr-2" />
              Use Current Location
            </>
          )}
        </Button>
      </div>

      {locationData.latitude && locationData.longitude && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">GPS Location Captured</span>
          </div>
          <p className="text-green-600 text-xs mt-1">
            Lat: {locationData.latitude.toFixed(6)}, Long: {locationData.longitude.toFixed(6)}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={locationData.address || ''}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your full address"
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={locationData.city || ''}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={locationData.state || ''}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="State"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pinCode">PIN Code</Label>
          <Input
            id="pinCode"
            value={locationData.pinCode || ''}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            placeholder="PIN Code"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={locationData.country || 'India'}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="Country"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Location'
          )}
        </Button>
      </div>
    </form>
  );
}
