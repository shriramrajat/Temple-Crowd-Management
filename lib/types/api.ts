/**
 * API Request and Response Type Definitions
 * Centralized type definitions for all API endpoints
 */

/**
 * Crowd level indicators for slot availability
 */
export type CrowdLevel = "low" | "medium" | "high" | "full";

/**
 * Booking status types
 */
export type BookingStatus = "confirmed" | "cancelled" | "checked-in";

/**
 * Slot availability response
 */
export interface SlotAvailability {
  id: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  capacity: number;
  bookedCount: number;
  crowdLevel: CrowdLevel;
  isAvailable: boolean;
  isActive: boolean;
}

/**
 * GET /api/slots response
 */
export interface GetSlotsResponse {
  slots: SlotAvailability[];
}

/**
 * Booking details
 */
export interface Booking {
  id: string;
  slotId: string;
  name: string;
  phone: string;
  email: string;
  numberOfPeople: number;
  qrCode: string;
  status: BookingStatus;
  checkedInAt: string | null; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  slot?: SlotAvailability;
}

/**
 * POST /api/bookings request body
 */
export interface CreateBookingRequest {
  name: string;
  phone: string;
  email: string;
  numberOfPeople: number;
  slotId: string;
}

/**
 * POST /api/bookings response
 */
export interface CreateBookingResponse {
  booking: Booking;
  qrCodeData: string; // Base64 encoded QR code image
}

/**
 * GET /api/bookings/[bookingId] response
 */
export interface GetBookingResponse {
  booking: Booking;
  qrCodeData: string; // Base64 encoded QR code image
}

/**
 * GET /api/bookings query parameters
 */
export interface GetBookingsQuery {
  phone?: string;
  email?: string;
}

/**
 * GET /api/bookings response
 */
export interface GetBookingsResponse {
  bookings: Booking[];
}

/**
 * DELETE /api/bookings/[bookingId] response
 */
export interface DeleteBookingResponse {
  message: string;
  booking: Booking;
}

/**
 * QR code data structure
 * Requirements: 6.3 - QR code data structure with bookingId, userId, slotId, timestamp, signature
 */
export interface QRCodeData {
  bookingId: string;
  userId?: string; // Optional for guest bookings
  slotId: string;
  name: string;
  date: string; // ISO date string
  slotTime: string; // "HH:MM-HH:MM" format
  numberOfPeople: number;
  timestamp: number; // Unix timestamp
}

/**
 * POST /api/verify request body
 */
export interface VerifyQRRequest {
  qrData: string; // Encoded QR data string
}

/**
 * POST /api/verify response
 */
export interface VerifyQRResponse {
  valid: boolean;
  message: string;
  booking?: Booking;
  error?: string;
}

/**
 * Admin dashboard statistics
 */
export interface DashboardStats {
  todayBookingsCount: number;
  totalCapacity: number;
  capacityUtilization: number; // Percentage
  activeSlots: number;
  slotBreakdown: Array<{
    slotTime: string;
    bookedCount: number;
    capacity: number;
    utilizationPercentage: number;
  }>;
}

/**
 * GET /api/admin/dashboard response
 */
export interface GetDashboardResponse {
  stats: DashboardStats;
}

/**
 * Slot configuration (admin view)
 */
export interface SlotConfig {
  id: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/**
 * GET /api/admin/slots response
 */
export interface GetAdminSlotsResponse {
  slots: SlotConfig[];
}

/**
 * POST /api/admin/slots request body
 */
export interface CreateSlotRequest {
  date: Date | string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive?: boolean;
}

/**
 * POST /api/admin/slots response
 */
export interface CreateSlotResponse {
  slot: SlotConfig;
}

/**
 * PUT /api/admin/slots/[slotId] request body
 */
export interface UpdateSlotRequest {
  startTime?: string;
  endTime?: string;
  capacity?: number;
  isActive?: boolean;
}

/**
 * PUT /api/admin/slots/[slotId] response
 */
export interface UpdateSlotResponse {
  slot: SlotConfig;
}

/**
 * DELETE /api/admin/slots/[slotId] response
 */
export interface DeleteSlotResponse {
  message: string;
}

/**
 * GET /api/admin/bookings query parameters
 */
export interface GetAdminBookingsQuery {
  date?: string; // YYYY-MM-DD format
  status?: BookingStatus;
  search?: string; // Search by name, phone, or email
  page?: number;
  limit?: number;
}

/**
 * GET /api/admin/bookings response
 */
export interface GetAdminBookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Standard API error response
 */
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
