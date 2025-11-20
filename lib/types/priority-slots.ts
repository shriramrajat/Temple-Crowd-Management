/**
 * Priority Slot Type Definitions
 * 
 * This file contains TypeScript interfaces and types for priority darshan slot
 * allocation and management for pilgrims with accessibility needs.
 */

import type { AccessibilityCategory, AccessibilityProfile } from './accessibility';

/**
 * Priority slot status
 */
export type SlotStatus = 'available' | 'filling' | 'full';

/**
 * Slot allocation status
 */
export type AllocationStatus = 'confirmed' | 'checked-in' | 'completed' | 'cancelled';

/**
 * Priority slot with capacity and accessibility information
 */
export interface PrioritySlot {
  id: string;
  slotTime: Date;
  duration: number; // minutes
  capacity: number;
  reserved: number;
  available: number;
  accessibilityCategories: AccessibilityCategory[];
  location: string;
  status: SlotStatus;
}

/**
 * Slot allocation for a specific pilgrim
 */
export interface SlotAllocation {
  allocationId: string;
  pilgrimId: string;
  slotId: string;
  accessibilityProfile: AccessibilityProfile;
  bookingTime: Date;
  status: AllocationStatus;
  qrCode: string;
  estimatedWaitTime: number; // minutes
}

/**
 * Slot quota management for priority reservations
 */
export interface SlotQuota {
  totalCapacity: number;
  priorityReserved: number; // 20% minimum
  priorityUsed: number;
  generalCapacity: number;
  utilizationRate: number;
}
