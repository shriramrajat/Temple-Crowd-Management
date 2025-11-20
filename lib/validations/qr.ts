import { z } from "zod";

/**
 * Zod schema for QR code data structure
 * Validates the decoded QR code data
 * Requirements: 6.1, 6.2, 6.3 - QR code data structure with bookingId, userId, slotId, timestamp, signature
 */
export const qrCodeDataSchema = z.object({
  bookingId: z.string().uuid("Invalid booking ID"),
  
  userId: z.string().uuid("Invalid user ID").optional(),
  
  slotId: z.string().uuid("Invalid slot ID"),
  
  name: z.string().min(1, "Name is required"),
  
  date: z.string().datetime("Invalid date format"),
  
  slotTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 
      "Slot time must be in HH:MM-HH:MM format"),
  
  numberOfPeople: z
    .number()
    .int("Number of people must be a whole number")
    .min(1, "At least 1 person is required")
    .max(10, "Maximum 10 people allowed"),
  
  timestamp: z
    .number()
    .int("Timestamp must be a valid Unix timestamp")
    .positive("Timestamp must be positive"),
});

/**
 * Type inference from QR code data schema
 */
export type QRCodeData = z.infer<typeof qrCodeDataSchema>;

/**
 * Zod schema for QR verification request
 */
export const verifyQRSchema = z.object({
  qrData: z.string().min(1, "QR data is required"),
});

/**
 * Type for QR verification request
 */
export type VerifyQRRequest = z.infer<typeof verifyQRSchema>;
