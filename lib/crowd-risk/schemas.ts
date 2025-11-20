/**
 * Zod Schemas for Runtime Validation
 * 
 * This file contains Zod schemas for validating crowd risk engine data at runtime.
 * Requirements: 1.1, 1.3, 6.1, 6.4
 */

import { z } from 'zod';
import {
  ThresholdLevel,
  NotificationChannel,
  AlertType,
  AreaType,
  EmergencyTrigger,
  DensityUnit,
} from './types';

// ============================================================================
// Enum Schemas
// ============================================================================

export const ThresholdLevelSchema = z.nativeEnum(ThresholdLevel);
export const NotificationChannelSchema = z.nativeEnum(NotificationChannel);
export const AlertTypeSchema = z.nativeEnum(AlertType);
export const AreaTypeSchema = z.nativeEnum(AreaType);
export const EmergencyTriggerSchema = z.nativeEnum(EmergencyTrigger);
export const DensityUnitSchema = z.nativeEnum(DensityUnit);

// ============================================================================
// Core Data Model Schemas
// ============================================================================

/**
 * Density reading validation schema
 * Requirement 1.1: Validate density readings with millisecond precision timestamps
 * Requirement 1.5: Timestamp validation
 */
export const DensityReadingSchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
  densityValue: z.number().nonnegative('Density value must be non-negative'),
  unit: DensityUnitSchema,
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Time-based profile validation schema
 * Requirement 6.2: Validate time-based threshold profiles
 */
export const TimeBasedProfileSchema = z.object({
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  thresholds: z.object({
    warningThreshold: z.number().positive('Warning threshold must be positive'),
    criticalThreshold: z.number().positive('Critical threshold must be positive'),
    emergencyThreshold: z.number().positive('Emergency threshold must be positive'),
  }),
});

/**
 * Threshold configuration validation schema
 * Requirement 6.1: Validate custom threshold values
 * Requirement 6.4: Ensure warning < critical < emergency
 */
export const ThresholdConfigSchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  warningThreshold: z.number().positive('Warning threshold must be positive'),
  criticalThreshold: z.number().positive('Critical threshold must be positive'),
  emergencyThreshold: z.number().positive('Emergency threshold must be positive'),
  timeProfile: z.array(TimeBasedProfileSchema).optional(),
}).refine(
  (data: { warningThreshold: number; criticalThreshold: number }) => data.warningThreshold < data.criticalThreshold,
  {
    message: 'Warning threshold must be less than critical threshold',
    path: ['warningThreshold'],
  }
).refine(
  (data: { criticalThreshold: number; emergencyThreshold: number }) => data.criticalThreshold < data.emergencyThreshold,
  {
    message: 'Critical threshold must be less than emergency threshold',
    path: ['criticalThreshold'],
  }
);

/**
 * Threshold evaluation validation schema
 * Requirement 1.2: Validate threshold evaluation results
 */
export const ThresholdEvaluationSchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  currentLevel: ThresholdLevelSchema,
  previousLevel: ThresholdLevelSchema,
  densityValue: z.number().nonnegative('Density value must be non-negative'),
  threshold: z.number().positive('Threshold must be positive'),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
  isEscalation: z.boolean(),
});

/**
 * Alert metadata validation schema
 * Requirement 2.2: Validate alert metadata
 * Requirement 3.2: Validate suggested actions
 */
export const AlertMetadataSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  affectedPilgrimCount: z.number().int().nonnegative().optional(),
  suggestedActions: z.array(z.string()).optional(),
  alternativeRoutes: z.array(z.string()).optional(),
});

/**
 * Alert event validation schema
 * Requirement 1.2: Validate alert events
 * Requirement 1.4: Validate alert metadata
 */
export const AlertEventSchema = z.object({
  id: z.string().min(1, 'Alert ID is required'),
  type: AlertTypeSchema,
  severity: ThresholdLevelSchema,
  areaId: z.string().min(1, 'Area ID is required'),
  areaName: z.string().min(1, 'Area name is required'),
  densityValue: z.number().nonnegative('Density value must be non-negative'),
  threshold: z.number().positive('Threshold must be positive'),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
  metadata: AlertMetadataSchema,
});

/**
 * Monitored area validation schema
 * Requirement 1.1: Validate area definitions
 */
export const MonitoredAreaSchema = z.object({
  id: z.string().min(1, 'Area ID is required'),
  name: z.string().min(1, 'Area name is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90'),
    longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180'),
  }),
  capacity: z.number().int().positive('Capacity must be a positive integer'),
  adjacentAreas: z.array(z.string()),
  metadata: z.object({
    type: AreaTypeSchema,
    description: z.string(),
  }),
});

// ============================================================================
// Notification Model Schemas
// ============================================================================

/**
 * Admin notification configuration validation schema
 * Requirement 2.5: Validate notification preferences
 */
export const AdminNotificationConfigSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  channels: z.array(NotificationChannelSchema).min(1, 'At least one channel is required'),
  severityFilter: z.array(ThresholdLevelSchema).min(1, 'At least one severity level is required'),
  areaFilter: z.array(z.string()).optional(),
});

/**
 * Notification result validation schema
 * Requirement 2.4: Validate delivery results
 */
export const NotificationResultSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  channel: NotificationChannelSchema,
  delivered: z.boolean(),
  deliveryTime: z.number().nonnegative('Delivery time must be non-negative'),
  error: z.string().optional(),
});

/**
 * Notification statistics validation schema
 * Requirement 2.4: Validate delivery statistics
 */
export const NotificationStatsSchema = z.object({
  totalSent: z.number().int().nonnegative('Total sent must be non-negative'),
  successRate: z.number().min(0).max(1, 'Success rate must be between 0 and 1'),
  averageDeliveryTime: z.number().nonnegative('Average delivery time must be non-negative'),
  failuresByChannel: z.record(z.number().int().nonnegative()),
});

/**
 * Pilgrim notification validation schema
 * Requirement 3.1: Validate pilgrim notifications
 * Requirement 3.2: Validate guidance and actions
 */
export const PilgrimNotificationSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  areaId: z.string().min(1, 'Area ID is required'),
  severity: ThresholdLevelSchema,
  message: z.string().min(1, 'Message is required'),
  suggestedActions: z.array(z.string()).min(1, 'At least one suggested action is required'),
  alternativeRoutes: z.array(z.string()).optional(),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
});

// ============================================================================
// Visual Indicator Model Schemas
// ============================================================================

/**
 * Indicator state validation schema
 * Requirement 4.1: Validate indicator states
 * Requirement 4.3: Validate blink rate (2 Hz for emergency)
 */
export const IndicatorStateSchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  color: z.enum(['green', 'yellow', 'red']),
  blinking: z.boolean(),
  blinkRate: z.number().positive('Blink rate must be positive').optional(),
  lastUpdate: z.number().int().positive('Last update must be a positive integer'),
}).refine(
  (data: { blinking: boolean; blinkRate?: number }) => !data.blinking || (data.blinking && data.blinkRate !== undefined),
  {
    message: 'Blink rate is required when blinking is true',
    path: ['blinkRate'],
  }
);

// ============================================================================
// Emergency Mode Model Schemas
// ============================================================================

/**
 * Emergency mode validation schema
 * Requirement 5.1: Validate emergency mode state
 * Requirement 5.4: Validate manual activation
 */
export const EmergencyModeSchema = z.object({
  active: z.boolean(),
  activatedAt: z.number().int().positive().optional(),
  activatedBy: EmergencyTriggerSchema,
  adminId: z.string().optional(),
  triggerAreaId: z.string().min(1, 'Trigger area ID is required'),
  affectedAreas: z.array(z.string()).min(1, 'At least one affected area is required'),
}).refine(
  (data: { active: boolean; activatedAt?: number }) => !data.active || (data.active && data.activatedAt !== undefined),
  {
    message: 'Activated at timestamp is required when emergency mode is active',
    path: ['activatedAt'],
  }
).refine(
  (data: { activatedBy: EmergencyTrigger; adminId?: string }) => data.activatedBy !== EmergencyTrigger.MANUAL || data.adminId !== undefined,
  {
    message: 'Admin ID is required for manual emergency activation',
    path: ['adminId'],
  }
);

// ============================================================================
// Configuration and Audit Model Schemas
// ============================================================================

/**
 * Configuration audit entry validation schema
 * Requirement 6.5: Validate audit log entries
 */
export const ConfigAuditEntrySchema = z.object({
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
  adminId: z.string().min(1, 'Admin ID is required'),
  areaId: z.string().min(1, 'Area ID is required'),
  previousConfig: ThresholdConfigSchema,
  newConfig: ThresholdConfigSchema,
  reason: z.string().optional(),
});

/**
 * Alert acknowledgment validation schema
 * Requirement 2.1: Validate alert acknowledgments
 */
export const AlertAcknowledgmentSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
});

/**
 * Alert resolution validation schema
 * Requirement 1.4: Validate alert resolutions
 */
export const AlertResolutionSchema = z.object({
  resolvedAt: z.number().int().positive('Resolved at must be a positive integer'),
  resolvedBy: z.string().min(1, 'Resolved by is required'),
  notes: z.string().min(1, 'Resolution notes are required'),
});

/**
 * Alert log entry validation schema
 * Requirement 1.4: Validate alert log entries
 */
export const AlertLogEntrySchema = z.object({
  id: z.string().min(1, 'Alert log ID is required'),
  alertEvent: AlertEventSchema,
  notificationResults: z.object({
    adminNotifications: z.array(NotificationResultSchema),
    pilgrimCount: z.number().int().nonnegative('Pilgrim count must be non-negative'),
  }),
  acknowledgments: z.array(AlertAcknowledgmentSchema),
  resolution: AlertResolutionSchema.optional(),
});

/**
 * Density history entry validation schema
 * Requirement 1.1: Validate density history entries
 */
export const DensityHistoryEntrySchema = z.object({
  areaId: z.string().min(1, 'Area ID is required'),
  timestamp: z.number().int().positive('Timestamp must be a positive integer'),
  densityValue: z.number().nonnegative('Density value must be non-negative'),
  thresholdLevel: ThresholdLevelSchema,
});

// ============================================================================
// Validation Model Schemas
// ============================================================================

/**
 * Validation error validation schema
 */
export const ValidationErrorSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  message: z.string().min(1, 'Message is required'),
  code: z.string().min(1, 'Code is required'),
});

/**
 * Validation result validation schema
 * Requirement 6.4: Validate threshold validation results
 */
export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(ValidationErrorSchema),
});

// ============================================================================
// State Management Schemas
// ============================================================================

/**
 * Alert context state validation schema
 */
export const AlertContextStateSchema = z.object({
  activeAlerts: z.array(AlertEventSchema),
  emergencyMode: EmergencyModeSchema.nullable(),
  indicatorStates: z.map(z.string(), IndicatorStateSchema),
  unacknowledgedCount: z.number().int().nonnegative('Unacknowledged count must be non-negative'),
});

/**
 * Admin dashboard state validation schema
 */
export const AdminDashboardStateSchema = z.object({
  areas: z.array(MonitoredAreaSchema),
  currentDensities: z.map(z.string(), DensityReadingSchema),
  recentAlerts: z.array(AlertEventSchema),
  notificationConfig: AdminNotificationConfigSchema,
});

// ============================================================================
// Error Handling Schemas
// ============================================================================

/**
 * Retry configuration validation schema
 */
export const RetryConfigSchema = z.object({
  maxAttempts: z.number().int().positive('Max attempts must be a positive integer'),
  backoffMs: z.number().int().positive('Backoff must be a positive integer'),
  backoffMultiplier: z.number().positive('Backoff multiplier must be positive'),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates data against a schema and returns typed result
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validates threshold configuration and returns validation result
 * Requirement 6.4: Threshold validation helper
 */
export function validateThresholdConfig(config: unknown) {
  const result = ThresholdConfigSchema.safeParse(config);
  
  if (result.success) {
    return {
      valid: true,
      errors: [],
    };
  }
  
  return {
    valid: false,
    errors: result.error.errors.map((err: z.ZodIssue) => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    })),
  };
}

/**
 * Validates time-based profile for overlapping time ranges
 * Requirement 6.2: Time profile validation
 */
export function validateTimeProfiles(profiles: unknown[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return { valid: true, errors: [] };
  }
  
  // Validate each profile schema
  for (let i = 0; i < profiles.length; i++) {
    const result = TimeBasedProfileSchema.safeParse(profiles[i]);
    if (!result.success) {
      errors.push(`Profile ${i + 1}: ${result.error.errors[0].message}`);
      continue;
    }
    
    const profile = result.data;
    
    // Check if start time is before end time
    const [startHour, startMin] = profile.startTime.split(':').map(Number);
    const [endHour, endMin] = profile.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (startMinutes >= endMinutes) {
      errors.push(`Profile ${i + 1}: Start time must be before end time`);
    }
    
    // Check threshold ordering
    if (profile.thresholds.warningThreshold >= profile.thresholds.criticalThreshold) {
      errors.push(`Profile ${i + 1}: Warning threshold must be less than critical threshold`);
    }
    if (profile.thresholds.criticalThreshold >= profile.thresholds.emergencyThreshold) {
      errors.push(`Profile ${i + 1}: Critical threshold must be less than emergency threshold`);
    }
  }
  
  // Check for overlapping time ranges
  for (let i = 0; i < profiles.length; i++) {
    for (let j = i + 1; j < profiles.length; j++) {
      const profile1 = profiles[i] as any;
      const profile2 = profiles[j] as any;
      
      const [start1Hour, start1Min] = profile1.startTime.split(':').map(Number);
      const [end1Hour, end1Min] = profile1.endTime.split(':').map(Number);
      const [start2Hour, start2Min] = profile2.startTime.split(':').map(Number);
      const [end2Hour, end2Min] = profile2.endTime.split(':').map(Number);
      
      const start1 = start1Hour * 60 + start1Min;
      const end1 = end1Hour * 60 + end1Min;
      const start2 = start2Hour * 60 + start2Min;
      const end2 = end2Hour * 60 + end2Min;
      
      // Check for overlap
      if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
        errors.push(`Profiles ${i + 1} and ${j + 1} have overlapping time ranges`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
