/**
 * Central export file for all validation schemas
 */

// Command Center schemas
export {
  DensityLevelSchema,
  AlertSeveritySchema,
  AlertTypeSchema,
  WarningStatusSchema,
  TimeRangeSchema,
  ConnectionStatusSchema,
  ZoneCoordinatesSchema,
  ZoneSchema,
  ZoneUpdateSchema,
  AlertSchema,
  FootfallDataPointSchema,
  HighDensityWarningSchema,
  WebSocketMessageSchema,
  DashboardStateSchema,
  ApiResponseSchema,
  FootfallQueryParamsSchema,
  ZoneStatisticsSchema,
  ZonesArraySchema,
  AlertsArraySchema,
  WarningsArraySchema,
  FootfallDataArraySchema,
} from './command-center';

// Accessibility schemas
export {
  AccessibilityCategorySchema,
  MobilitySpeedSchema,
  EmergencyContactSchema,
  AccessibilityProfileSchema,
  AccessibilityPreferencesSchema,
  AccessibilityProfileFormSchema,
} from './accessibility';

// Priority Slot schemas
export {
  SlotStatusSchema,
  AllocationStatusSchema,
  PrioritySlotSchema,
  SlotAllocationSchema,
  SlotQuotaSchema,
  PrioritySlotsArraySchema,
  SlotAllocationsArraySchema,
} from './priority-slots';

// Route Optimization schemas
export {
  SurfaceTypeSchema,
  AmenityTypeSchema,
  CoordinatesSchema,
  PathAccessibilitySchema,
  AmenitySchema,
  PathSegmentSchema,
  OptimizedRouteSchema,
  AlternativeRouteSchema,
  RouteRequestSchema,
  PathSegmentsArraySchema,
  AmenitiesArraySchema,
} from './route-optimization';

// Notification schemas
export {
  NotificationTypeSchema,
  NotificationPrioritySchema,
  AccessibilityNotificationSchema,
  NotificationTriggerSchema,
  NotificationCreateSchema,
  NotificationsArraySchema,
  NotificationTriggersArraySchema,
} from './notifications';

// Analytics schemas
export {
  PrioritySlotUtilizationSchema,
  WaitTimeComparisonSchema,
  RouteMetricsSchema,
  NotificationMetricsSchema,
  AccessibilityMetricsSchema,
  UtilizationAlertSchema,
  AccessibilityMetricsArraySchema,
  UtilizationAlertsArraySchema,
} from './accessibility-analytics';
