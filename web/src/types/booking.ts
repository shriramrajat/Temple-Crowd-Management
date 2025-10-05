import { FirestoreDocument } from './firestore';
import { BOOKING_STATUS, BOOKING_ERROR_CODES } from '../constants/booking';

export type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];

// Core booking interface
export interface Booking extends FirestoreDocument {
  userId: string;
  slotTime: Date;
  status: BookingStatus;
}

// Time slot interface
export interface TimeSlot {
  id: string;
  time: string;
  date: Date;
  capacity: number;
  booked: number;
  available: boolean;
}

// Booking error interface
export interface BookingError {
  code: string;
  message: string;
  details?: any;
}

export type BookingErrorCode = typeof BOOKING_ERROR_CODES[keyof typeof BOOKING_ERROR_CODES];

// Service interface for booking operations
export interface IBookingService {
  getAvailableSlots(date: Date): Promise<TimeSlot[]>;
  createBooking(userId: string, slotTime: Date): Promise<Booking>;
  getBooking(bookingId: string): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<void>;
  getUserBookings(userId: string): Promise<Booking[]>;
}

// QR code data structure
export interface QRCodeData {
  bookingId: string;
  userId: string;
  slotTime: string; // ISO string format
  status: BookingStatus;
  verificationCode: string; // Hash for security
}

// Component prop interfaces
export interface DarshanBookingProps {
  userId?: string; // Optional - will use authenticated user if not provided
  onBookingComplete?: (booking: Booking) => void;
  onError?: (error: BookingError) => void;
  onAuthRequired?: () => void;
  className?: string;
}

export interface DatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export interface TimeSlotPickerProps {
  date: Date;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
  loading?: boolean;
  error?: BookingError | null;
  className?: string;
}

export interface BookingConfirmationProps {
  booking: Booking;
  qrCodeData: QRCodeData;
  onBackToBooking: () => void;
  onDownloadQR?: () => void;
  className?: string;
}

// Hook return types
export interface UseBookingServiceReturn {
  availableSlots: TimeSlot[];
  loading: boolean;
  error: BookingError | null;
  createBooking: (userId: string, slotTime: Date) => Promise<Booking>;
  getAvailableSlots: (date: Date) => Promise<void>;
  clearError: () => void;
}

export interface UseQRCodeReturn {
  qrCodeUrl: string | null;
  loading: boolean;
  error: BookingError | null;
  generateQRCode: (data: QRCodeData) => Promise<void>;
  downloadQRCode: (filename?: string) => void;
  saveQRCode: (filename?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
  isReady: boolean;
}

// Firestore document structures
export interface BookingDocument {
  userId: string;
  slotTime: Date;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlotDocument {
  date: Date;
  time: string;
  capacity: number;
  booked: number;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}