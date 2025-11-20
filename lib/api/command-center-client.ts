/**
 * Command Center API Client
 * 
 * REST API client functions for fetching command center data.
 * Handles initial data loading and provides typed API responses.
 */

import {
  Zone,
  Alert,
  FootfallDataPoint,
  TimeRange,
  ApiResponse,
} from '@/lib/types/command-center';
import {
  ZonesArraySchema,
  AlertsArraySchema,
  FootfallDataArraySchema,
} from '@/lib/schemas/command-center';

/**
 * Base API configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with timeout and error handling
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw error;
  }
}

/**
 * Parse and validate API response
 */
async function parseResponse<T>(
  response: Response,
  validator: (data: unknown) => T
): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new ApiError(
      `API request failed: ${response.statusText}`,
      response.status,
      errorText
    );
  }

  const data = await response.json();
  
  try {
    return validator(data);
  } catch (error) {
    throw new ApiError(
      'Invalid response data format',
      500,
      error instanceof Error ? error.message : 'Validation failed'
    );
  }
}

/**
 * Fetch all zones with current status
 */
export async function fetchZones(): Promise<Zone[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/admin/zones`);
  
  return parseResponse(response, (data) => {
    const parsed = ZonesArraySchema.parse(data);
    // Convert date strings to Date objects
    return parsed.map(zone => ({
      ...zone,
      lastUpdated: new Date(zone.lastUpdated),
    }));
  });
}

/**
 * Fetch recent alerts
 */
export async function fetchAlerts(limit = 50): Promise<Alert[]> {
  const url = new URL(`${API_BASE_URL}/api/admin/alerts`);
  url.searchParams.set('limit', limit.toString());
  
  const response = await fetchWithTimeout(url.toString());
  
  return parseResponse(response, (data) => {
    const parsed = AlertsArraySchema.parse(data);
    // Convert date strings to Date objects
    return parsed.map(alert => ({
      ...alert,
      timestamp: new Date(alert.timestamp),
    }));
  });
}

/**
 * Fetch footfall data with optional filtering
 */
export async function fetchFootfallData(params: {
  zoneId?: string;
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
}): Promise<FootfallDataPoint[]> {
  const url = new URL(`${API_BASE_URL}/api/admin/footfall`);
  
  if (params.zoneId) {
    url.searchParams.set('zoneId', params.zoneId);
  }
  url.searchParams.set('timeRange', params.timeRange);
  if (params.startDate) {
    url.searchParams.set('startDate', params.startDate.toISOString());
  }
  if (params.endDate) {
    url.searchParams.set('endDate', params.endDate.toISOString());
  }
  
  const response = await fetchWithTimeout(url.toString());
  
  return parseResponse(response, (data) => {
    const parsed = FootfallDataArraySchema.parse(data);
    // Convert date strings to Date objects
    return parsed.map(point => ({
      ...point,
      timestamp: new Date(point.timestamp),
    }));
  });
}

/**
 * Fetch initial dashboard data in parallel
 */
export async function fetchInitialData(timeRange: TimeRange = 'hourly'): Promise<{
  zones: Zone[];
  alerts: Alert[];
  footfallData: FootfallDataPoint[];
}> {
  try {
    const [zones, alerts, footfallData] = await Promise.all([
      fetchZones(),
      fetchAlerts(),
      fetchFootfallData({ timeRange }),
    ]);

    return { zones, alerts, footfallData };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch initial data',
      500,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
