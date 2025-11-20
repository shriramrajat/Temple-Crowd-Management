/**
 * SOS Assistance System Type Definitions
 * 
 * This file contains all TypeScript interfaces and enums for the SOS emergency
 * assistance system, including alert types, urgency levels, location data, and
 * alert status tracking.
 */

/**
 * Alert Type Enum
 * Defines the categories of emergencies that pilgrims can report
 * Requirements: 2.2, 2.3
 */
export enum AlertType {
  MEDICAL = 'medical',
  SECURITY = 'security',
  LOST = 'lost',
  ACCIDENT = 'accident',
  GENERAL = 'general'
}

/**
 * Urgency Level Enum
 * Defines the severity classification for emergency alerts
 * Requirements: 3.1, 3.2, 3.4
 */
export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Alert Status Enum
 * Tracks the lifecycle state of an SOS alert
 * Requirements: 5.1, 7.2, 7.5
 */
export enum AlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  RESPONDING = 'responding',
  RESOLVED = 'resolved'
}

/**
 * Location Data Interface
 * Contains geographic coordinates and human-readable location information
 * Requirements: 4.1, 4.2, 4.5
 */
export interface LocationData {
  /** Latitude coordinate */
  latitude: number;
  
  /** Longitude coordinate */
  longitude: number;
  
  /** Location accuracy in meters */
  accuracy: number;
  
  /** Human-readable address or landmark description (optional) */
  address?: string;
  
  /** Zone or area identifier within the temple/pilgrimage site (optional) */
  zone?: string;
  
  /** Timestamp when location was captured */
  timestamp: number;
}

/**
 * Pilgrim Information Interface
 * Contains identifying information about the pilgrim sending the alert
 * Requirements: 5.5
 */
export interface PilgrimInfo {
  /** Pilgrim's name (optional) */
  name?: string;
  
  /** Pilgrim's contact phone number (optional) */
  phone?: string;
  
  /** Emergency contact phone number (optional) */
  emergencyContact?: string;
  
  /** User ID if authenticated (optional) */
  userId?: string;
}

/**
 * Authority Acknowledgment Interface
 * Contains information about the temple authority who acknowledged an alert
 * Requirements: 7.4, 7.5
 */
export interface AuthorityAcknowledgment {
  /** Authority's name or identifier */
  authorityName: string;
  
  /** Authority's ID */
  authorityId: string;
  
  /** Timestamp when alert was acknowledged */
  acknowledgedAt: number;
  
  /** Optional notes from the authority */
  notes?: string;
}

/**
 * SOS Alert Interface
 * Main data structure for an emergency alert
 * Requirements: 1.1, 1.2, 2.3, 3.2, 4.1, 5.1
 */
export interface SOSAlert {
  /** Unique identifier for the alert */
  id: string;
  
  /** Type of emergency */
  alertType: AlertType;
  
  /** Urgency level of the emergency */
  urgencyLevel: UrgencyLevel;
  
  /** Current status of the alert */
  status: AlertStatus;
  
  /** Location data where the alert was triggered */
  location: LocationData;
  
  /** Information about the pilgrim who sent the alert */
  pilgrimInfo: PilgrimInfo;
  
  /** Timestamp when the alert was created */
  createdAt: number;
  
  /** Timestamp when the alert was last updated */
  updatedAt: number;
  
  /** Acknowledgment information (if acknowledged) */
  acknowledgment?: AuthorityAcknowledgment;
  
  /** Optional additional notes or context */
  notes?: string;
}

/**
 * SOS Alert Creation Request
 * Data required to create a new SOS alert
 * Requirements: 1.2, 2.3, 3.3
 */
export interface CreateSOSAlertRequest {
  /** Type of emergency */
  alertType: AlertType;
  
  /** Urgency level of the emergency */
  urgencyLevel: UrgencyLevel;
  
  /** Location data where the alert was triggered */
  location: LocationData;
  
  /** Information about the pilgrim (optional) */
  pilgrimInfo?: PilgrimInfo;
  
  /** Optional additional notes */
  notes?: string;
}

/**
 * SOS Alert Response
 * Response returned after creating an alert
 * Requirements: 1.2, 6.1
 */
export interface CreateSOSAlertResponse {
  /** Whether the alert was created successfully */
  success: boolean;
  
  /** The created alert ID */
  alertId: string;
  
  /** The complete alert object */
  alert: SOSAlert;
  
  /** Optional message */
  message?: string;
  
  /** Processing time in milliseconds (for performance monitoring) */
  processingTime?: number;
}

/**
 * Alert Filter Options
 * Options for filtering alerts in the admin dashboard
 * Requirements: 5.1
 */
export interface AlertFilterOptions {
  /** Filter by alert status */
  status?: AlertStatus | AlertStatus[];
  
  /** Filter by urgency level */
  urgencyLevel?: UrgencyLevel | UrgencyLevel[];
  
  /** Filter by alert type */
  alertType?: AlertType | AlertType[];
  
  /** Filter by date range (start timestamp) */
  startDate?: number;
  
  /** Filter by date range (end timestamp) */
  endDate?: number;
  
  /** Search by pilgrim name or location */
  searchQuery?: string;
}

/**
 * Location Error Types
 * Possible errors when capturing location
 * Requirements: 4.4, 4.5
 */
export enum LocationErrorType {
  PERMISSION_DENIED = 'permission_denied',
  POSITION_UNAVAILABLE = 'position_unavailable',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Location Error Interface
 * Error information for location capture failures
 * Requirements: 4.4, 4.5
 */
export interface LocationError {
  /** Type of location error */
  type: LocationErrorType;
  
  /** Human-readable error message */
  message: string;
  
  /** Original error code (if available) */
  code?: number;
}
