/**
 * Validation Schemas and Utilities
 * Central export point for all validation schemas and utilities
 */

// Booking validations
export {
  bookingFormSchema,
  createBookingSchema,
  validatePhoneNumber,
  validateEmail,
  type BookingFormData,
  type CreateBookingRequest,
} from "./booking";

// Slot validations
export {
  slotConfigSchema,
  updateSlotSchema,
  slotQuerySchema,
  type SlotConfigData,
  type UpdateSlotRequest,
  type SlotQueryParams,
} from "./slot";

// QR validations
export {
  qrCodeDataSchema,
  verifyQRSchema,
  type QRCodeData,
  type VerifyQRRequest,
} from "./qr";

// Admin validations
export {
  adminBookingsQuerySchema,
  dashboardQuerySchema,
  type AdminBookingsQuery,
  type DashboardQuery,
} from "./admin";

// Auth validations
export {
  passwordSchema,
  emailSchema,
  registerUserSchema,
  loginUserSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  passwordChangeSchema,
  validatePasswordStrength,
  getPasswordValidationErrors,
  validateEmailFormat,
  type RegisterUserData,
  type LoginUserData,
  type PasswordResetRequestData,
  type PasswordResetData,
  type PasswordChangeData,
} from "./auth";
