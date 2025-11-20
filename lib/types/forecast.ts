/**
 * Forecast Types
 * Type definitions for predictive crowd insights and forecasting
 */

/**
 * Forecast point representing a single prediction
 */
export interface ForecastPoint {
  zoneId: string;
  zoneName: string;
  timestamp: string;
  predictedFootfall: number;
  actualFootfall?: number; // Present for past/current times
  confidence: number; // 0-100
  capacity: number;
}

/**
 * Peak period identification
 */
export interface PeakPeriod {
  zoneId: string;
  zoneName: string;
  startTime: string; // HH:mm format
  endTime: string;
  expectedFootfall: number;
  capacity: number;
  crowdLevel: 'high' | 'very-high'; // high: 80-90%, very-high: >90%
}

/**
 * Data source type for predictions
 */
export type DataSource = 'historical' | 'simulated' | 'hybrid';

/**
 * Forecast metadata
 */
export interface ForecastMetadata {
  generatedAt: string;
  forecastWindow: {
    start: string;
    end: string;
  };
  dataSource: DataSource;
}

/**
 * Chart data point for visualization
 */
export interface ChartDataPoint {
  timestamp: string;
  predicted: number;
  actual: number | null;
  confidence: number;
  confidenceBandLow: number;
  confidenceBandHigh: number;
}

/**
 * Forecast API response
 */
export interface ForecastResponse {
  predictions: ForecastPoint[];
  metadata: ForecastMetadata;
}

/**
 * Peak hours API response
 */
export interface PeakHoursResponse {
  date: string;
  peaks: PeakPeriod[];
  metadata: {
    calculatedAt: string;
    dataSource: DataSource;
  };
}
