/**
 * Central export file for all types
 */

// Command Center types
export type {
  DensityLevel,
  AlertSeverity,
  AlertType,
  WarningStatus,
  TimeRange,
  ConnectionStatus,
  ZoneCoordinates,
  Zone,
  ZoneUpdate,
  Alert,
  FootfallDataPoint,
  HighDensityWarning,
  WebSocketMessage,
  DashboardState,
  ApiResponse,
  FootfallQueryParams,
  ZoneStatistics,
} from './command-center';

// Accessibility types
export type {
  AccessibilityCategory,
  MobilitySpeed,
  EmergencyContact,
  AccessibilityProfile,
  AccessibilityPreferences,
} from './accessibility';

// Priority Slot types
export type {
  SlotStatus,
  AllocationStatus,
  PrioritySlot,
  SlotAllocation,
  SlotQuota,
} from './priority-slots';

// Route Optimization types
export type {
  SurfaceType,
  AmenityType,
  Coordinates,
  PathAccessibility,
  Amenity,
  PathSegment,
  AlternativeRoute,
  OptimizedRoute,
} from './route-optimization';

// Notification types
export type {
  NotificationType,
  NotificationPriority,
  AccessibilityNotification,
  NotificationTrigger,
} from './notifications';

// Analytics types
export type {
  PrioritySlotUtilization,
  WaitTimeComparison,
  RouteMetrics,
  NotificationMetrics,
  AccessibilityMetrics,
  UtilizationAlert,
} from './accessibility-analytics';

// Forecast types
export type {
  ForecastPoint,
  PeakPeriod,
  DataSource,
  ForecastMetadata,
  ChartDataPoint,
  ForecastResponse,
  PeakHoursResponse,
} from './forecast';
