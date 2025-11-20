import { z } from "zod";

/**
 * Zod schema for admin bookings query parameters
 * Used for filtering and pagination in admin booking management
 */
export const adminBookingsQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  
  status: z
    .enum(["confirmed", "cancelled", "checked-in"])
    .optional(),
  
  search: z
    .string()
    .max(255, "Search query too long")
    .optional(),
  
  page: z
    .number()
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),
  
  limit: z
    .number()
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

/**
 * Type for admin bookings query
 */
export type AdminBookingsQuery = z.infer<typeof adminBookingsQuerySchema>;

/**
 * Zod schema for admin dashboard date query
 */
export const dashboardQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

/**
 * Type for dashboard query parameters
 */
export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
