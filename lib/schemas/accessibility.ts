/**
 * Accessibility Profile Validation Schemas
 * 
 * This file contains Zod validation schemas for runtime type checking
 * and data validation for accessibility profiles and preferences.
 */

import { z } from 'zod';

/**
 * Accessibility category enum schema
 */
export const AccessibilityCategorySchema = z.enum([
  'elderly',
  'differently-abled',
  'wheelchair-user',
  'women-only-route',
]);

/**
 * Mobility speed enum schema
 */
export const MobilitySpeedSchema = z.enum(['slow', 'moderate', 'normal']);

/**
 * Emergency contact schema with validation
 */
export const EmergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Invalid phone number format'),
  relationship: z.string().min(1, 'Relationship is required').max(50),
});

/**
 * Accessibility profile schema with validation rules
 */
export const AccessibilityProfileSchema = z.object({
  pilgrimId: z.string().min(1, 'Pilgrim ID is required'),
  categories: z.array(AccessibilityCategorySchema).min(1, 'At least one category must be selected'),
  mobilitySpeed: MobilitySpeedSchema,
  requiresAssistance: z.boolean(),
  emergencyContact: EmergencyContactSchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
}).refine(
  (data: { updatedAt: Date; createdAt: Date }) => data.updatedAt >= data.createdAt,
  {
    message: 'Updated date must be after or equal to created date',
    path: ['updatedAt'],
  }
);

/**
 * Accessibility preferences schema
 */
export const AccessibilityPreferencesSchema = z.object({
  notifyOnAssistanceZone: z.boolean(),
  prioritySlotReminders: z.boolean(),
  weatherAlerts: z.boolean(),
  routeRecalculationAlerts: z.boolean(),
});

/**
 * Profile form input schema (for form validation)
 */
export const AccessibilityProfileFormSchema = z.object({
  categories: z.array(AccessibilityCategorySchema).min(1, 'Please select at least one accessibility category'),
  mobilitySpeed: MobilitySpeedSchema,
  requiresAssistance: z.boolean(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required').max(100),
    phone: z.string().regex(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number'),
    relationship: z.string().min(1, 'Relationship is required').max(50),
  }).optional(),
  preferences: AccessibilityPreferencesSchema,
});
