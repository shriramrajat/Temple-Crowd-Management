/**
 * Geocoding Utilities
 * 
 * Utilities for reverse geocoding (converting coordinates to addresses)
 * and zone detection for the SOS system.
 * 
 * Requirements: 4.2
 */

import { LocationData } from '@/lib/types/sos';

/**
 * Zone definitions for temple/pilgrimage areas
 * These can be customized based on actual temple layout
 */
interface ZoneDefinition {
  id: string;
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

/**
 * Example zone definitions
 * In production, these would be loaded from a configuration or database
 */
const TEMPLE_ZONES: ZoneDefinition[] = [
  {
    id: 'main-temple',
    name: 'Main Temple Area',
    bounds: {
      minLat: 18.5200,
      maxLat: 18.5220,
      minLng: 73.8550,
      maxLng: 73.8570
    }
  },
  {
    id: 'parking',
    name: 'Parking Area',
    bounds: {
      minLat: 18.5180,
      maxLat: 18.5200,
      minLng: 73.8540,
      maxLng: 73.8560
    }
  },
  {
    id: 'dining-hall',
    name: 'Dining Hall',
    bounds: {
      minLat: 18.5220,
      maxLat: 18.5240,
      minLng: 73.8560,
      maxLng: 73.8580
    }
  },
  {
    id: 'accommodation',
    name: 'Accommodation Area',
    bounds: {
      minLat: 18.5240,
      maxLat: 18.5260,
      minLng: 73.8570,
      maxLng: 73.8590
    }
  }
];

/**
 * Detect which zone the coordinates fall into
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Zone name or undefined if not in any defined zone
 */
export function detectZone(latitude: number, longitude: number): string | undefined {
  for (const zone of TEMPLE_ZONES) {
    if (
      latitude >= zone.bounds.minLat &&
      latitude <= zone.bounds.maxLat &&
      longitude >= zone.bounds.minLng &&
      longitude <= zone.bounds.maxLng
    ) {
      return zone.name;
    }
  }
  
  return undefined;
}

/**
 * Reverse geocode coordinates to a human-readable address
 * 
 * For MVP, this uses a mock implementation. In production, this would
 * integrate with a geocoding service like:
 * - Google Maps Geocoding API
 * - Mapbox Geocoding API
 * - OpenStreetMap Nominatim
 * - Browser's built-in geocoding (if available)
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise resolving to address string or undefined
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  try {
    // Mock implementation for MVP
    // Returns a formatted coordinate string as fallback
    const mockAddress = generateMockAddress(latitude, longitude);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockAddress;
    
    /* Production implementation example:
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SOS-Assistance-System'
        }
      }
    );
    
    if (!response.ok) {
      return undefined;
    }
    
    const data = await response.json();
    return data.display_name || undefined;
    */
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return undefined;
  }
}

/**
 * Generate a mock address for MVP
 * Creates a readable location string from coordinates
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Formatted address string
 */
function generateMockAddress(latitude: number, longitude: number): string {
  // Format coordinates to 4 decimal places
  const lat = latitude.toFixed(4);
  const lng = longitude.toFixed(4);
  
  // Determine cardinal directions
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  
  return `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lng))}°${lngDir}`;
}

/**
 * Enrich location data with address and zone information
 * 
 * @param locationData - Basic location data with coordinates
 * @returns Promise resolving to enriched location data
 */
export async function enrichLocationData(
  locationData: Omit<LocationData, 'address' | 'zone'>
): Promise<LocationData> {
  const { latitude, longitude } = locationData;
  
  // Detect zone
  const zone = detectZone(latitude, longitude);
  
  // Get address via reverse geocoding
  const address = await reverseGeocode(latitude, longitude);
  
  return {
    ...locationData,
    address,
    zone
  };
}

/**
 * Format location data for display
 * 
 * @param location - Location data to format
 * @returns Formatted location string
 */
export function formatLocationForDisplay(location: LocationData): string {
  const parts: string[] = [];
  
  // Add zone if available
  if (location.zone) {
    parts.push(location.zone);
  }
  
  // Add address if available
  if (location.address) {
    parts.push(location.address);
  }
  
  // Add coordinates as fallback
  if (parts.length === 0) {
    parts.push(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
  }
  
  // Add accuracy information
  if (location.accuracy) {
    parts.push(`(±${Math.round(location.accuracy)}m)`);
  }
  
  return parts.join(' • ');
}
