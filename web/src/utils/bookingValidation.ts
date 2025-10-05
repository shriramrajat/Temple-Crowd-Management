import { BOOKING_VALIDATION, BOOKING_ERROR_CODES } from '../constants/booking';
import { BookingError } from '../types/booking';

/**
 * Validates if a date is within the allowed booking range
 */
export function validateBookingDate(date: Date): BookingError | null {
  const now = new Date();
  const minDate = new Date(now.getTime() + BOOKING_VALIDATION.MIN_ADVANCE_HOURS * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + BOOKING_VALIDATION.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);

  if (date < minDate) {
    return {
      code: BOOKING_ERROR_CODES.INVALID_DATE,
      message: `Bookings must be made at least ${BOOKING_VALIDATION.MIN_ADVANCE_HOURS} hours in advance.`
    };
  }

  if (date > maxDate) {
    return {
      code: BOOKING_ERROR_CODES.INVALID_DATE,
      message: `Bookings can only be made up to ${BOOKING_VALIDATION.MAX_ADVANCE_DAYS} days in advance.`
    };
  }

  return null;
}

/**
 * Validates if a time is within business hours
 */
export function validateBookingTime(time: string): BookingError | null {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;
  
  const [startHours, startMinutes] = BOOKING_VALIDATION.BUSINESS_HOURS.START.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;
  
  const [endHours, endMinutes] = BOOKING_VALIDATION.BUSINESS_HOURS.END.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;

  if (timeInMinutes < startTimeInMinutes || timeInMinutes >= endTimeInMinutes) {
    return {
      code: BOOKING_ERROR_CODES.INVALID_TIME,
      message: `Bookings are only available between ${BOOKING_VALIDATION.BUSINESS_HOURS.START} and ${BOOKING_VALIDATION.BUSINESS_HOURS.END}.`
    };
  }

  return null;
}

/**
 * Validates if a slot has available capacity
 */
export function validateSlotCapacity(booked: number, capacity: number): BookingError | null {
  if (booked >= capacity) {
    return {
      code: BOOKING_ERROR_CODES.CAPACITY_EXCEEDED,
      message: 'This time slot is fully booked. Please select a different time.'
    };
  }

  return null;
}

/**
 * Generates a time slot ID from date and time
 */
export function generateTimeSlotId(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timeFormatted = time.replace(':', '-');
  
  return `${year}-${month}-${day}-${timeFormatted}`;
}

/**
 * Checks if a date is today or in the future
 */
export function isValidFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date >= today;
}

/**
 * Formats a date for display in the UI
 */
export function formatBookingDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats a time for display in the UI
 */
export function formatBookingTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}