/**
 * Command Center Dashboard Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for the Admin Command Center Dashboard.
 */

import { z } from 'zod';

/**
 * Enum schemas for type-safe string literals
 */
export const DensityLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);

export const AlertSeveritySchema = z.enum(['info', 'warning', 'critical']);

export const AlertTypeSchema = z.enum(['high-density', 'capacity', 'system', 'safety']);

export const WarningStatusSchema = z.enum(['active', 'resolved']);

export const TimeRangeSchema = z.enum(['hourly', 'daily', 'weekly']);

export const ConnectionStatusSchema = z.enum(['connected', 'disconnected', 'reconnecting']);

/**
 * Zone coordinates schema
 */
export const ZoneCoordinatesSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

/**
 * Zone schema with validation rules
 */
export const ZoneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  coordinates: ZoneCoordinatesSchema,
  currentOccupancy: z.number().int().nonnegative(),
  maxCapacity: z.number().int().positive(),
  densityLevel: DensityLevelSchema,
  densityThreshold: z.number().positive(),
  lastUpdated: z.coerce.date(),
}).refine(
  (data: { currentOccupancy: number; maxCapacity: number }) => data.currentOccupancy <= data.maxCapacity,
  {
    message: 'Current occupancy cannot exceed max capacity',
    path: ['currentOccupancy'],
  }
);

/**
 * Zone update schema for real-time updates
 */
export const ZoneUpdateSchema = z.object({
  zoneId: z.string().min(1),
  occupancy: z.number().int().nonnegative(),
  densityLevel: DensityLevelSchema,
  timestamp: z.coerce.date(),
});

/**
 * Alert schema with validation rules
 */
export const AlertSchema = z.object({
  id: z.string().min(1),
  timestamp: z.coerce.date(),
  severity: AlertSeveritySchema,
  zoneId: z.string().min(1),
  zoneName: z.string().min(1),
  type: AlertTypeSchema,
  message: z.string().min(1),
  acknowledged: z.boolean(),
});

/**
 * Footfall data point schema
 */
export const FootfallDataPointSchema = z.object({
  timestamp: z.coerce.date(),
  count: z.number().int().nonnegative(),
  zoneId: z.string().optional(),
});

/**
 * High-density warning schema
 */
export const HighDensityWarningSchema = z.object({
  id: z.string().min(1),
  zoneId: z.string().min(1),
  zoneName: z.string().min(1),
  currentDensity: z.number().nonnegative(),
  threshold: z.number().positive(),
  timestamp: z.coerce.date(),
  status: WarningStatusSchema,
}).refine(
  (data: { status: string; currentDensity: number; threshold: number }) => 
    data.status === 'active' ? data.currentDensity >= data.threshold : true,
  {
    message: 'Active warnings must have current density >= threshold',
    path: ['currentDensity'],
  }
);

/**
 * WebSocket message schemas
 */
export const WebSocketMessageSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('zone_update'),
    payload: ZoneUpdateSchema,
  }),
  z.object({
    type: z.literal('alert'),
    payload: AlertSchema,
  }),
  z.object({
    type: z.literal('warning'),
    payload: HighDensityWarningSchema,
  }),
  z.object({
    type: z.literal('footfall'),
    payload: FootfallDataPointSchema,
  }),
  z.object({
    type: z.literal('connection_status'),
    payload: z.object({
      status: ConnectionStatusSchema,
    }),
  }),
]);

/**
 * Dashboard state schema
 */
export const DashboardStateSchema = z.object({
  selectedZone: z.string().nullable(),
  timeRange: TimeRangeSchema,
  connectionStatus: ConnectionStatusSchema,
});

/**
 * API response wrapper schema
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    timestamp: z.coerce.date(),
  });

/**
 * Footfall query parameters schema
 */
export const FootfallQueryParamsSchema = z.object({
  zoneId: z.string().optional(),
  timeRange: TimeRangeSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data: { startDate?: Date; endDate?: Date }) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

/**
 * Zone statistics schema
 */
export const ZoneStatisticsSchema = z.object({
  zoneId: z.string().min(1),
  zoneName: z.string().min(1),
  currentOccupancy: z.number().int().nonnegative(),
  maxCapacity: z.number().int().positive(),
  occupancyPercentage: z.number().min(0).max(100),
  isWarning: z.boolean(),
  densityLevel: DensityLevelSchema,
}).refine(
  (data: { currentOccupancy: number; maxCapacity: number }) => data.currentOccupancy <= data.maxCapacity,
  {
    message: 'Current occupancy cannot exceed max capacity',
    path: ['currentOccupancy'],
  }
).refine(
  (data: { currentOccupancy: number; maxCapacity: number; occupancyPercentage: number }) => {
    const calculatedPercentage = (data.currentOccupancy / data.maxCapacity) * 100;
    return Math.abs(calculatedPercentage - data.occupancyPercentage) < 0.01;
  },
  {
    message: 'Occupancy percentage must match calculated value',
    path: ['occupancyPercentage'],
  }
);

/**
 * Array schemas for bulk data validation
 */
export const ZonesArraySchema = z.array(ZoneSchema);
export const AlertsArraySchema = z.array(AlertSchema);
export const WarningsArraySchema = z.array(HighDensityWarningSchema);
export const FootfallDataArraySchema = z.array(FootfallDataPointSchema);
