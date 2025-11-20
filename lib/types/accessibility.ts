/**
 * Accessibility Profile Type Definitions
 * 
 * This file contains TypeScript interfaces and types for accessibility profiles
 * and preferences for pilgrims with special needs.
 */

/**
 * Accessibility category classifications
 */
export type AccessibilityCategory = 
  | 'elderly'
  | 'differently-abled'
  | 'wheelchair-user'
  | 'women-only-route';

/**
 * Mobility speed classifications for route calculation
 */
export type MobilitySpeed = 'slow' | 'moderate' | 'normal';

/**
 * Emergency contact information
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Accessibility profile for a pilgrim
 */
export interface AccessibilityProfile {
  pilgrimId: string;
  categories: AccessibilityCategory[];
  mobilitySpeed: MobilitySpeed;
  requiresAssistance: boolean;
  emergencyContact?: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Notification preferences for accessibility features
 */
export interface AccessibilityPreferences {
  notifyOnAssistanceZone: boolean;
  prioritySlotReminders: boolean;
  weatherAlerts: boolean;
  routeRecalculationAlerts: boolean;
}
