// Booking status constants
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

// Booking validation rules
export const BOOKING_VALIDATION = {
  MAX_ADVANCE_DAYS: 30,
  MIN_ADVANCE_HOURS: 2,
  SLOT_DURATION_MINUTES: 30,
  MAX_CAPACITY_PER_SLOT: 50,
  BUSINESS_HOURS: {
    START: '06:00',
    END: '20:00'
  }
} as const;

// Booking error codes
export const BOOKING_ERROR_CODES = {
  NETWORK_ERROR: 'network_error',
  AUTH_REQUIRED: 'auth_required',
  PERMISSION_DENIED: 'permission_denied',
  UNAUTHENTICATED: 'unauthenticated',
  SLOT_UNAVAILABLE: 'slot_unavailable',
  INVALID_DATE: 'invalid_date',
  INVALID_TIME: 'invalid_time',
  CAPACITY_EXCEEDED: 'capacity_exceeded',
  DUPLICATE_BOOKING: 'duplicate_booking',
  VALIDATION_ERROR: 'validation_error',
  FIRESTORE_ERROR: 'firestore_error',
  QR_GENERATION_ERROR: 'qr_generation_error',
  COMPONENT_ERROR: 'component_error',
  TIMEOUT_ERROR: 'timeout_error',
  CONNECTION_ERROR: 'connection_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

// Error messages for user-friendly display
export const BOOKING_ERROR_MESSAGES = {
  [BOOKING_ERROR_CODES.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
  [BOOKING_ERROR_CODES.AUTH_REQUIRED]: 'Please sign in to make a booking.',
  [BOOKING_ERROR_CODES.PERMISSION_DENIED]: 'You do not have permission to perform this action. Please sign in and try again.',
  [BOOKING_ERROR_CODES.UNAUTHENTICATED]: 'Your session has expired. Please sign in again.',
  [BOOKING_ERROR_CODES.SLOT_UNAVAILABLE]: 'This time slot is no longer available. Please select a different time.',
  [BOOKING_ERROR_CODES.INVALID_DATE]: 'Please select a valid date for your booking.',
  [BOOKING_ERROR_CODES.INVALID_TIME]: 'Please select a valid time slot.',
  [BOOKING_ERROR_CODES.CAPACITY_EXCEEDED]: 'This time slot is fully booked. Please select a different time.',
  [BOOKING_ERROR_CODES.DUPLICATE_BOOKING]: 'You already have a booking for this time slot.',
  [BOOKING_ERROR_CODES.VALIDATION_ERROR]: 'Please check your booking details and try again.',
  [BOOKING_ERROR_CODES.FIRESTORE_ERROR]: 'Unable to save your booking. Please try again.',
  [BOOKING_ERROR_CODES.QR_GENERATION_ERROR]: 'Unable to generate QR code. Your booking is confirmed but the QR code is unavailable.',
  [BOOKING_ERROR_CODES.COMPONENT_ERROR]: 'Something went wrong with the booking interface. Please refresh the page and try again.',
  [BOOKING_ERROR_CODES.TIMEOUT_ERROR]: 'The request timed out. Please try again.',
  [BOOKING_ERROR_CODES.CONNECTION_ERROR]: 'Unable to connect to the server. Please check your connection and try again.',
  [BOOKING_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
} as const;

// Firestore collection names
export const FIRESTORE_COLLECTIONS = {
  BOOKINGS: 'bookings',
  TIME_SLOTS: 'timeSlots'
} as const;

// Time slot generation settings
export const TIME_SLOT_CONFIG = {
  INTERVAL_MINUTES: 30,
  SLOTS_PER_DAY: 28, // 6 AM to 8 PM with 30-minute intervals
  DEFAULT_CAPACITY: 50
} as const;