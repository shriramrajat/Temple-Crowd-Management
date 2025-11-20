import { z } from "zod";

/**
 * Zod schema for slot configuration validation
 * Used by admin to create and update time slots
 */
export const slotConfigSchema = z.object({
  date: z.coerce.date({
    required_error: "Date is required",
    invalid_type_error: "Invalid date format",
  }),
  
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format (e.g., 09:00)"),
  
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format (e.g., 10:00)"),
  
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity cannot exceed 1000"),
  
  isActive: z.boolean().default(true),
}).refine(
  (data) => {
    // Validate that end time is after start time
    const [startHour, startMin] = data.startTime.split(":").map(Number);
    const [endHour, endMin] = data.endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return endMinutes > startMinutes;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

/**
 * Type inference from slot config schema
 */
export type SlotConfigData = z.infer<typeof slotConfigSchema>;

/**
 * Zod schema for updating slot configuration
 * All fields are optional for partial updates
 */
export const updateSlotSchema = z.object({
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format")
    .optional(),
  
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format")
    .optional(),
  
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity cannot exceed 1000")
    .optional(),
  
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    // Only validate time relationship if both times are provided
    if (data.startTime && data.endTime) {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

/**
 * Type for slot update request
 */
export type UpdateSlotRequest = z.infer<typeof updateSlotSchema>;

/**
 * Zod schema for slot query parameters
 */
export const slotQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

/**
 * Type for slot query parameters
 */
export type SlotQueryParams = z.infer<typeof slotQuerySchema>;
