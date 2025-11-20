/**
 * Command Center Dashboard Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the Admin Command Center Dashboard.
 * These types ensure type safety across the dashboard components and data management.
 */

/**
 * Density level classification for zones
 */
export type DensityLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Alert type classifications
 */
export type AlertType = 'high-density' | 'capacity' | 'system' | 'safety';

/**
 * Warning status
 */
export type WarningStatus = 'active' | 'resolved';

/**
 * Time range options for footfall data
 */
export type TimeRange = 'hourly' | 'daily' | 'weekly';

/**
 * Connection status for real-time data
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

/**
 * Zone coordinates for map rendering
 */
export interface ZoneCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Zone represents a defined area within the venue with monitoring parameters
 */
export interface Zone {
  id: string;
  name: string;
  coordinates: ZoneCoordinates;
  currentOccupancy: number;
  maxCapacity: number;
  densityLevel: DensityLevel;
  densityThreshold: number;
  lastUpdated: Date;
}

/**
 * Real-time zone update payload from WebSocket
 */
export interface ZoneUpdate {
  zoneId: string;
  occupancy: number;
  densityLevel: DensityLevel;
  timestamp: Date;
}

/**
 * Alert represents a critical event or notification
 */
export interface Alert {
  id: string;
  timestamp: Date;
  severity: AlertSeverity;
  zoneId: string;
  zoneName: string;
  type: AlertType;
  message: string;
  acknowledged: boolean;
}

/**
 * Footfall data point for time-series visualization
 */
export interface FootfallDataPoint {
  timestamp: Date;
  count: number;
  zoneId?: string;
}

/**
 * High-density warning triggered when crowd density exceeds thresholds
 */
export interface HighDensityWarning {
  id: string;
  zoneId: string;
  zoneName: string;
  currentDensity: number;
  threshold: number;
  timestamp: Date;
  status: WarningStatus;
}

/**
 * WebSocket message types for real-time updates
 */
export type WebSocketMessage =
  | { type: 'zone_update'; payload: ZoneUpdate }
  | { type: 'alert'; payload: Alert }
  | { type: 'warning'; payload: HighDensityWarning }
  | { type: 'footfall'; payload: FootfallDataPoint }
  | { type: 'connection_status'; payload: { status: ConnectionStatus } };

/**
 * Dashboard state management
 */
export interface DashboardState {
  selectedZone: string | null;
  timeRange: TimeRange;
  connectionStatus: ConnectionStatus;
}

/**
 * API response wrapper for REST endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

/**
 * Query parameters for footfall data endpoint
 */
export interface FootfallQueryParams {
  zoneId?: string;
  timeRange: TimeRange;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Zone statistics for status display
 */
export interface ZoneStatistics {
  zoneId: string;
  zoneName: string;
  currentOccupancy: number;
  maxCapacity: number;
  occupancyPercentage: number;
  isWarning: boolean; // true when >= 80% capacity
  densityLevel: DensityLevel;
}
