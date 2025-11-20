import { z } from "zod";

/**
 * Phone number validation utility for Indian format (10 digits)
 * Validates that the phone number is exactly 10 digits
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Email validation utility
 * Uses standard email regex pattern
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Zod schema for booking form validation
 * Validates user input for creating a darshan booking
 */
export const bookingFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
  
  phone: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid Indian phone number starting with 6-9"),
  
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  
  numberOfPeople: z
    .number()
    .int("Number of people must be a whole number")
    .min(1, "At least 1 person is required")
    .max(10, "Maximum 10 people allowed per booking"),
  
  slotId: z.string().min(1, "Slot ID is required"),
});

/**
 * Type inference from booking form schema
 */
export type BookingFormData = z.infer<typeof bookingFormSchema>;

/**
 * Zod schema for booking creation API request
 */
export const createBookingSchema = bookingFormSchema;

/**
 * Type for booking creation request
 */
export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
