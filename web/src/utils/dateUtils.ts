import { BOOKING_VALIDATION, TIME_SLOT_CONFIG } from '../constants/booking';
import { TimeSlot } from '../types/booking';

/**
 * Date formatting utilities for the darshan booking system
 */

/**
 * Formats a date for display in the UI
 * @param date - The date to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export function formatDisplayDate(
  date: Date, 
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string {
  return date.toLocaleDateString('en-US', options);
}

/**
 * Formats a date for compact display (e.g., "Dec 25, 2024")
 * @param date - The date to format
 * @returns Compact formatted date string
 */
export function formatCompactDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats time for display in 12-hour format
 * @param time - Time string in HH:MM format
 * @returns Formatted time string with AM/PM
 */
export function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const hour = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Formats time for 24-hour display
 * @param time - Time string in HH:MM format
 * @returns Formatted time string in 24-hour format
 */
export function format24HourTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Formats time for display (alias for formatDisplayTime)
 * @param time - Time string in HH:MM format
 * @returns Formatted time string with AM/PM
 */
export function formatTime(time: string): string {
  return formatDisplayTime(time);
}

/**
 * Parses a date string into a Date object
 * @param dateString - Date string to parse
 * @returns Parsed Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Parses a time string and validates format
 * @param timeString - Time string in HH:MM format
 * @returns Parsed time object or null if invalid
 */
export function parseTime(timeString: string): { hours: number; minutes: number } | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeString.match(timeRegex);
  
  if (!match) {
    return null;
  }
  
  return {
    hours: parseInt(match[1], 10),
    minutes: parseInt(match[2], 10)
  };
}

/**
 * Converts a Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date to convert
 * @returns ISO date string
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Creates a Date object from date and time strings
 * @param dateString - Date string in YYYY-MM-DD format
 * @param timeString - Time string in HH:MM format
 * @returns Combined Date object
 */
export function combineDateAndTime(dateString: string, timeString: string): Date {
  return new Date(`${dateString}T${timeString}:00`);
}

/**
 * Time slot generation utilities
 */

/**
 * Generates all possible time slots for a given date
 * @param date - The date to generate slots for
 * @returns Array of time slot objects
 */
export function generateTimeSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startTime = BOOKING_VALIDATION.BUSINESS_HOURS.START;
  const endTime = BOOKING_VALIDATION.BUSINESS_HOURS.END;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTimeInMinutes = startHours * 60 + startMinutes;
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  for (let timeInMinutes = startTimeInMinutes; timeInMinutes < endTimeInMinutes; timeInMinutes += TIME_SLOT_CONFIG.INTERVAL_MINUTES) {
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const slotId = generateTimeSlotId(date, timeString);
    
    slots.push({
      id: slotId,
      time: timeString,
      date: new Date(date),
      capacity: TIME_SLOT_CONFIG.DEFAULT_CAPACITY,
      booked: 0,
      available: true
    });
  }
  
  return slots;
}

/**
 * Generates a unique time slot ID
 * @param date - The date of the slot
 * @param time - The time of the slot in HH:MM format
 * @returns Unique slot ID string
 */
export function generateTimeSlotId(date: Date, time: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const timeFormatted = time.replace(':', '-');
  
  return `${year}-${month}-${day}-${timeFormatted}`;
}

/**
 * Parses a time slot ID back into date and time components
 * @param slotId - Time slot ID in format YYYY-MM-DD-HH-MM
 * @returns Object with date and time, or null if invalid
 */
export function parseTimeSlotId(slotId: string): { date: Date; time: string } | null {
  const parts = slotId.split('-');
  if (parts.length !== 5) {
    return null;
  }
  
  const [year, month, day, hours, minutes] = parts;
  
  // Validate numeric values
  const yearNum = parseInt(year);
  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  const hoursNum = parseInt(hours);
  const minutesNum = parseInt(minutes);
  
  // Check for valid ranges
  if (
    isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum) || 
    isNaN(hoursNum) || isNaN(minutesNum) ||
    monthNum < 1 || monthNum > 12 ||
    dayNum < 1 || dayNum > 31 ||
    hoursNum < 0 || hoursNum > 23 ||
    minutesNum < 0 || minutesNum > 59
  ) {
    return null;
  }
  
  const date = new Date(yearNum, monthNum - 1, dayNum);
  const time = `${hours}:${minutes}`;
  
  // Verify the date is valid (handles invalid dates like Feb 30)
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    return null;
  }
  
  return { date, time };
}

/**
 * Date validation utilities
 */

/**
 * Checks if a date is today
 * @param date - Date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns True if the date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
}

/**
 * Checks if a date is within the allowed booking range
 * @param date - Date to check
 * @returns True if the date is within booking range
 */
export function isValidBookingDate(date: Date): boolean {
  const now = new Date();
  const minDate = new Date(now.getTime() + BOOKING_VALIDATION.MIN_ADVANCE_HOURS * 60 * 60 * 1000);
  const maxDate = new Date(now.getTime() + BOOKING_VALIDATION.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
  
  return date >= minDate && date <= maxDate;
}

/**
 * Gets the minimum allowed booking date
 * @returns Minimum booking date
 */
export function getMinBookingDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + BOOKING_VALIDATION.MIN_ADVANCE_HOURS * 60 * 60 * 1000);
}

/**
 * Gets the maximum allowed booking date
 * @returns Maximum booking date
 */
export function getMaxBookingDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + BOOKING_VALIDATION.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Checks if a time is within business hours
 * @param time - Time string in HH:MM format
 * @returns True if time is within business hours
 */
export function isWithinBusinessHours(time: string): boolean {
  const parsedTime = parseTime(time);
  if (!parsedTime) {
    return false;
  }
  
  const timeInMinutes = parsedTime.hours * 60 + parsedTime.minutes;
  
  const [startHours, startMinutes] = BOOKING_VALIDATION.BUSINESS_HOURS.START.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;
  
  const [endHours, endMinutes] = BOOKING_VALIDATION.BUSINESS_HOURS.END.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;
  
  return timeInMinutes >= startTimeInMinutes && timeInMinutes < endTimeInMinutes;
}

/**
 * Gets the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between dates
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets the start of day for a given date
 * @param date - Input date
 * @returns Date set to start of day (00:00:00)
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the end of day for a given date
 * @param date - Input date
 * @returns Date set to end of day (23:59:59.999)
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Timezone and locale utilities
 */

/**
 * Gets the user's timezone
 * @returns User's timezone string
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Converts a date to the user's local timezone
 * @param date - Date to convert
 * @returns Date in user's local timezone
 */
export function toLocalTimezone(date: Date): Date {
  return new Date(date.toLocaleString());
}

/**
 * Formats a date for a specific timezone
 * @param date - Date to format
 * @param timezone - Target timezone
 * @param options - Formatting options
 * @returns Formatted date string in specified timezone
 */
export function formatDateInTimezone(
  date: Date, 
  timezone: string, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  return date.toLocaleDateString('en-US', {
    ...options,
    timeZone: timezone
  });
}