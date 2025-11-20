/**
 * useLocation Hook
 * 
 * Custom React hook for managing geolocation functionality in the SOS system.
 * Handles browser Geolocation API integration, permission management, error handling,
 * and location caching.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LocationData, LocationError, LocationErrorType } from '@/lib/types/sos';
import { enrichLocationData } from '@/lib/utils/geocoding';
import { startMeasurement, PerformanceMetric } from '@/lib/utils/performance-monitor';

interface UseLocationReturn {
  /** Current location data (null if not yet captured) */
  location: LocationData | null;
  
  /** Whether location is currently being fetched */
  loading: boolean;
  
  /** Error information if location capture failed */
  error: LocationError | null;
  
  /** Function to request current location */
  requestLocation: () => Promise<LocationData | null>;
  
  /** Whether location permission has been granted */
  hasPermission: boolean | null;
}

const LOCATION_TIMEOUT = 5000; // 5 seconds as per requirements
const CACHE_DURATION = 30000; // Cache location for 30 seconds

/**
 * Custom hook for managing geolocation
 * 
 * Features:
 * - Browser Geolocation API integration
 * - Permission request handling
 * - High accuracy mode with 5-second timeout
 * - Error handling for permission denied, unavailable, and timeout scenarios
 * - Location caching mechanism
 */
export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  // Cache reference to avoid unnecessary API calls
  const cacheRef = useRef<{
    location: LocationData;
    timestamp: number;
  } | null>(null);

  /**
   * Check if geolocation is supported by the browser
   */
  const isGeolocationSupported = useCallback(() => {
    return 'geolocation' in navigator;
  }, []);

  /**
   * Check permission status on mount
   */
  useEffect(() => {
    if (!isGeolocationSupported()) {
      setHasPermission(false);
      return;
    }

    // Check permission status if Permissions API is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' })
        .then((result) => {
          setHasPermission(result.state === 'granted');
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setHasPermission(result.state === 'granted');
          });
        })
        .catch(() => {
          // Permissions API not fully supported, will check on request
          setHasPermission(null);
        });
    }
  }, [isGeolocationSupported]);

  /**
   * Convert GeolocationPositionError to LocationError
   */
  const convertGeolocationError = useCallback((geoError: GeolocationPositionError): LocationError => {
    switch (geoError.code) {
      case geoError.PERMISSION_DENIED:
        return {
          type: LocationErrorType.PERMISSION_DENIED,
          message: 'Location permission denied. Please enable location services to send SOS alerts with your location.',
          code: geoError.code
        };
      
      case geoError.POSITION_UNAVAILABLE:
        return {
          type: LocationErrorType.POSITION_UNAVAILABLE,
          message: 'Location information is unavailable. Please check your device settings.',
          code: geoError.code
        };
      
      case geoError.TIMEOUT:
        return {
          type: LocationErrorType.TIMEOUT,
          message: 'Location request timed out. Please try again.',
          code: geoError.code
        };
      
      default:
        return {
          type: LocationErrorType.UNKNOWN,
          message: 'An unknown error occurred while getting your location.',
          code: geoError.code
        };
    }
  }, []);

  /**
   * Request current location from the browser
   * Uses cached location if available and fresh
   * Includes performance monitoring (Requirement: 1.1 - target < 3 seconds)
   */
  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    // Start performance measurement
    const endMeasurement = startMeasurement(PerformanceMetric.LOCATION_CAPTURE, {
      cached: false,
      highAccuracy: true,
    });

    // Check if geolocation is supported
    if (!isGeolocationSupported()) {
      const notSupportedError: LocationError = {
        type: LocationErrorType.UNKNOWN,
        message: 'Geolocation is not supported by your browser.'
      };
      setError(notSupportedError);
      setHasPermission(false);
      endMeasurement(false);
      return null;
    }

    // Check cache first
    const now = Date.now();
    if (cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
      setLocation(cacheRef.current.location);
      setError(null);
      endMeasurement(true); // Cached location is instant
      return cacheRef.current.location;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        // Success callback
        async (position) => {
          const basicLocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Enrich with address and zone information
          const locationData = await enrichLocationData(basicLocationData);

          // Update cache
          cacheRef.current = {
            location: locationData,
            timestamp: now
          };

          setLocation(locationData);
          setLoading(false);
          setHasPermission(true);
          endMeasurement(true);
          resolve(locationData);
        },
        // Error callback
        (geoError) => {
          const locationError = convertGeolocationError(geoError);
          setError(locationError);
          setLoading(false);
          
          // Update permission status
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setHasPermission(false);
          }
          
          endMeasurement(false);
          resolve(null);
        },
        // Options - high accuracy mode with 5-second timeout
        {
          enableHighAccuracy: true,
          timeout: LOCATION_TIMEOUT,
          maximumAge: 0 // Don't use cached position from browser
        }
      );
    });
  }, [isGeolocationSupported, convertGeolocationError]);

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission
  };
}
