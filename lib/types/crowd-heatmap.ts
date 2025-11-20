/**
 * Type definitions for the Real-Time Crowd Heatmap feature
 * 
 * This file contains all TypeScript interfaces and types used across
 * the crowd heatmap components, hooks, and API routes.
 */

// ============================================================================
// Core Data Models
// ============================================================================

/**
 * Represents a single zone within the temple complex
 * Contains all data needed to visualize and track crowd density
 */
export interface ZoneData {
  /** Unique identifier for the zone (e.g., "zone-main-entrance") */
  id: string;
  
  /** Human-readable name displayed in the UI */
  name: string;
  
  /** Current number of people in the zone */
  footfall: number;
  
  /** Grid position for layout rendering */
  position: {
    row: number;
    col: number;
  };
  
  /** Maximum capacity of the zone (default: 500) */
  capacity: number;
  
  /** ISO 8601 timestamp of last update */
  lastUpdated: string;
  
  /** Trend indicator based on recent changes */
  trend?: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Historical snapshot data structure
 */
export interface HistoricalSnapshot {
  id: string;
  zoneId: string;
  zoneName: string;
  footfall: number;
  capacity: number;
  timestamp: Date;
  dayOfWeek: number;
  hourOfDay: number;
  createdAt: Date;
}

/**
 * API response structure from the /api/crowd-data endpoint
 */
export interface CrowdDataResponse {
  /** Array of all zone data */
  zones: ZoneData[];
  
  /** ISO 8601 timestamp when data was generated */
  timestamp: string;
  
  /** Simulation parameters for debugging/monitoring */
  simulationParams: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    peakFactor: number;
  };

  /** Optional historical data from last 24 hours (when includeHistory=true) */
  historicalData?: HistoricalSnapshot[];
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * Props for the main CrowdHeatmap component
 */
export interface CrowdHeatmapProps {
  /** Polling interval in milliseconds (default: 3000) */
  refreshInterval?: number;
  
  /** Maximum capacity per zone (default: 500) */
  maxCapacity?: number;
  
  /** Additional CSS classes for styling */
  className?: string;
}

/**
 * Props for individual HeatmapZone component
 */
export interface HeatmapZoneProps {
  /** Zone data to display */
  zone: ZoneData;
  
  /** Maximum capacity for density calculation */
  maxCapacity: number;
  
  /** Click/tap handler for zone interaction */
  onClick: (zone: ZoneData) => void;
}

/**
 * Props for the ZoneDetailModal component
 */
export interface ZoneDetailModalProps {
  /** Selected zone data (null when modal is closed) */
  zone: ZoneData | null;
  
  /** Controls modal visibility */
  isOpen: boolean;
  
  /** Handler to close the modal */
  onClose: () => void;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for the useHeatmapData custom hook
 * Provides data fetching, loading states, and error handling
 */
export interface UseHeatmapDataReturn {
  /** Array of zone data from the API */
  zones: ZoneData[];
  
  /** Loading state during initial fetch or refresh */
  isLoading: boolean;
  
  /** Error object if fetch fails */
  error: Error | null;
  
  /** Timestamp of last successful data fetch */
  lastUpdate: Date | null;
  
  /** Manual refetch function for user-triggered updates */
  refetch: () => Promise<void>;
}

// ============================================================================
// Internal State Types
// ============================================================================

/**
 * Internal state structure for the CrowdHeatmap component
 */
export interface HeatmapState {
  /** Current zone data */
  zones: ZoneData[];
  
  /** Loading indicator state */
  isLoading: boolean;
  
  /** Last update timestamp */
  lastUpdate: Date | null;
  
  /** Currently selected zone for modal display */
  selectedZone: ZoneData | null;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Density level classification for color coding
 */
export type DensityLevel = 'low' | 'medium' | 'high';

/**
 * Time of day categories for simulation
 */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Trend direction for crowd movement
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable';

/**
 * Color mapping for density levels (Tailwind CSS classes)
 */
export interface DensityColorMap {
  low: string;
  medium: string;
  high: string;
}

/**
 * Responsive breakpoint definitions
 */
export interface ResponsiveBreakpoints {
  mobile: number;    // < 768px
  tablet: number;    // 768px - 1024px
  desktop: number;   // > 1024px
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Configuration for the IoT Simulator
 */
export interface SimulatorConfig {
  /** Number of zones to simulate */
  zoneCount: number;
  
  /** Maximum footfall per zone */
  maxCapacity: number;
  
  /** Maximum percentage change per update (0-1) */
  maxFluctuation: number;
  
  /** Time-of-day multipliers */
  timeMultipliers: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

/**
 * Configuration for heatmap visualization
 */
export interface HeatmapConfig {
  /** Density thresholds for color classification (0-1) */
  densityThresholds: {
    low: number;      // < 0.33
    medium: number;   // 0.33 - 0.66
    high: number;     // > 0.66
  };
  
  /** Animation durations in milliseconds */
  animations: {
    colorTransition: number;  // 300ms
    numberUpdate: number;     // 500ms
  };
  
  /** Polling configuration */
  polling: {
    interval: number;         // 3000ms
    retryDelay: number;       // 5000ms
    maxRetries: number;       // 3
  };
}
