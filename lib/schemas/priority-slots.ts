/**
 * Priority Slot Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for priority slot allocation and management.
 */

import { z } from 'zod';
import { AccessibilityCategorySchema, AccessibilityProfileSchema } from './accessibility';

/**
 * Slot status enum schema
 */
export const SlotStatusSchema = z.enum(['available', 'filling', 'full']);

/**
 * Allocation status enum schema
 */
export const AllocationStatusSchema = z.enum(['confirmed', 'checked-in', 'completed', 'cancelled']);

/**
 * Priority slot schema with validation rules
 */
export const PrioritySlotSchema = z.object({
  id: z.string().min(1, 'Slot ID is required'),
  slotTime: z.coerce.date(),
  duration: z.number().int().positive('Duration must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  reserved: z.number().int().nonnegative('Reserved count cannot be negative'),
  available: z.number().int().nonnegative('Available count cannot be negative'),
  accessibilityCategories: z.array(AccessibilityCategorySchema),
  location: z.string().min(1, 'Location is required'),
  status: SlotStatusSchema,
}).refine(
  (data: { reserved: number; capacity: number }) => data.reserved <= data.capacity,
  {
    message: 'Reserved count cannot exceed capacity',
    path: ['reserved'],
  }
).refine(
  (data: { available: number; capacity: number; reserved: number }) => 
    data.available === data.capacity - data.reserved,
  {
    message: 'Available count must equal capacity minus reserved',
    path: ['available'],
  }
);

/**
 * Slot allocation schema with validation rules
 */
export const SlotAllocationSchema = z.object({
  allocationId: z.string().min(1, 'Allocation ID is required'),
  pilgrimId: z.string().min(1, 'Pilgrim ID is required'),
  slotId: z.string().min(1, 'Slot ID is required'),
  accessibilityProfile: AccessibilityProfileSchema,
  bookingTime: z.coerce.date(),
  status: AllocationStatusSchema,
  qrCode: z.string().min(1, 'QR code is required'),
  estimatedWaitTime: z.number().int().nonnegative('Wait time cannot be negative'),
}).refine(
  (data: { estimatedWaitTime: number }) => data.estimatedWaitTime <= 30,
  {
    message: 'Wait time should not exceed 30 minutes for priority slots',
    path: ['estimatedWaitTime'],
  }
);

/**
 * Slot quota schema with validation rules
 */
export const SlotQuotaSchema = z.object({
  totalCapacity: z.number().int().positive('Total capacity must be positive'),
  priorityReserved: z.number().int().nonnegative('Priority reserved cannot be negative'),
  priorityUsed: z.number().int().nonnegative('Priority used cannot be negative'),
  generalCapacity: z.number().int().nonnegative('General capacity cannot be negative'),
  utilizationRate: z.number().min(0).max(100, 'Utilization rate must be between 0 and 100'),
}).refine(
  (data: { priorityReserved: number; totalCapacity: number }) => 
    data.priorityReserved >= data.totalCapacity * 0.2,
  {
    message: 'Priority reserved must be at least 20% of total capacity',
    path: ['priorityReserved'],
  }
).refine(
  (data: { priorityUsed: number; priorityReserved: number }) => 
    data.priorityUsed <= data.priorityReserved,
  {
    message: 'Priority used cannot exceed priority reserved',
    path: ['priorityUsed'],
  }
).refine(
  (data: { generalCapacity: number; totalCapacity: number; priorityReserved: number }) => 
    data.generalCapacity === data.totalCapacity - data.priorityReserved,
  {
    message: 'General capacity must equal total capacity minus priority reserved',
    path: ['generalCapacity'],
  }
);

/**
 * Array schemas for bulk data validation
 */
export const PrioritySlotsArraySchema = z.array(PrioritySlotSchema);
export const SlotAllocationsArraySchema = z.array(SlotAllocationSchema);
