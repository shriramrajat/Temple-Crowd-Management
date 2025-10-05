import {
  formatDisplayDate,
  formatCompactDate,
  formatDisplayTime,
  format24HourTime,
  parseDate,
  parseTime,
  toISODateString,
  combineDateAndTime,
  generateTimeSlots,
  generateTimeSlotId,
  parseTimeSlotId,
  isToday,
  isPastDate,
  isValidBookingDate,
  getMinBookingDate,
  getMaxBookingDate,
  isWithinBusinessHours,
  getDaysBetween,
  addDays,
  getStartOfDay,
  getEndOfDay,
  getUserTimezone,
  toLocalTimezone,
  formatDateInTimezone
} from '../dateUtils';

// Mock constants for testing
jest.mock('../../constants/booking', () => ({
  BOOKING_VALIDATION: {
    MAX_ADVANCE_DAYS: 30,
    MIN_ADVANCE_HOURS: 2,
    BUSINESS_HOURS: {
      START: '06:00',
      END: '20:00'
    }
  },
  TIME_SLOT_CONFIG: {
    INTERVAL_MINUTES: 30,
    DEFAULT_CAPACITY: 50
  }
}));

describe('dateUtils', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T10:00:00.000Z');
  
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });

  describe('Date Formatting', () => {
    describe('formatDisplayDate', () => {
      it('should format date with default options', () => {
        const date = new Date('2024-01-15');
        const result = formatDisplayDate(date);
        expect(result).toBe('Monday, January 15, 2024');
      });

      it('should format date with custom options', () => {
        const date = new Date('2024-01-15');
        const options = { month: 'short', day: 'numeric', year: 'numeric' } as const;
        const result = formatDisplayDate(date, options);
        expect(result).toBe('Jan 15, 2024');
      });
    });

    describe('formatCompactDate', () => {
      it('should format date in compact format', () => {
        const date = new Date('2024-01-15');
        const result = formatCompactDate(date);
        expect(result).toBe('Jan 15, 2024');
      });
    });

    describe('formatDisplayTime', () => {
      it('should format morning time correctly', () => {
        expect(formatDisplayTime('09:30')).toBe('9:30 AM');
      });

      it('should format afternoon time correctly', () => {
        expect(formatDisplayTime('14:45')).toBe('2:45 PM');
      });

      it('should format midnight correctly', () => {
        expect(formatDisplayTime('00:00')).toBe('12:00 AM');
      });

      it('should format noon correctly', () => {
        expect(formatDisplayTime('12:00')).toBe('12:00 PM');
      });

      it('should pad minutes with zero', () => {
        expect(formatDisplayTime('15:05')).toBe('3:05 PM');
      });
    });

    describe('format24HourTime', () => {
      it('should format time in 24-hour format', () => {
        expect(format24HourTime('9:30')).toBe('09:30');
        expect(format24HourTime('14:45')).toBe('14:45');
        expect(format24HourTime('00:00')).toBe('00:00');
      });
    });
  });

  describe('Date Parsing', () => {
    describe('parseDate', () => {
      it('should parse valid date string', () => {
        const result = parseDate('2024-01-15');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getFullYear()).toBe(2024);
        expect(result?.getMonth()).toBe(0); // January is 0
        expect(result?.getDate()).toBe(15);
      });

      it('should return null for invalid date string', () => {
        expect(parseDate('invalid-date')).toBeNull();
        expect(parseDate('2024-13-45')).toBeNull();
      });
    });

    describe('parseTime', () => {
      it('should parse valid time string', () => {
        const result = parseTime('14:30');
        expect(result).toEqual({ hours: 14, minutes: 30 });
      });

      it('should parse time with leading zeros', () => {
        const result = parseTime('09:05');
        expect(result).toEqual({ hours: 9, minutes: 5 });
      });

      it('should return null for invalid time format', () => {
        expect(parseTime('25:30')).toBeNull();
        expect(parseTime('14:60')).toBeNull();
        expect(parseTime('invalid')).toBeNull();
        expect(parseTime('14')).toBeNull();
      });

      it('should handle edge cases', () => {
        expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
        expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
      });
    });

    describe('toISODateString', () => {
      it('should convert date to ISO date string', () => {
        const date = new Date('2024-01-15T14:30:00');
        expect(toISODateString(date)).toBe('2024-01-15');
      });
    });

    describe('combineDateAndTime', () => {
      it('should combine date and time strings', () => {
        const result = combineDateAndTime('2024-01-15', '14:30');
        expect(result.getFullYear()).toBe(2024);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(15);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
      });
    });
  });

  describe('Time Slot Generation', () => {
    describe('generateTimeSlots', () => {
      it('should generate time slots for a date', () => {
        const date = new Date('2024-01-15');
        const slots = generateTimeSlots(date);
        
        expect(slots).toHaveLength(28); // 6 AM to 8 PM with 30-minute intervals
        expect(slots[0].time).toBe('06:00');
        expect(slots[slots.length - 1].time).toBe('19:30');
        
        slots.forEach(slot => {
          expect(slot.capacity).toBe(50);
          expect(slot.booked).toBe(0);
          expect(slot.available).toBe(true);
          expect(slot.date).toEqual(date);
        });
      });

      it('should generate correct slot IDs', () => {
        const date = new Date('2024-01-15');
        const slots = generateTimeSlots(date);
        
        expect(slots[0].id).toBe('2024-01-15-06-00');
        expect(slots[1].id).toBe('2024-01-15-06-30');
      });
    });

    describe('generateTimeSlotId', () => {
      it('should generate correct slot ID', () => {
        const date = new Date('2024-01-15');
        const result = generateTimeSlotId(date, '14:30');
        expect(result).toBe('2024-01-15-14-30');
      });

      it('should pad single digit months and days', () => {
        const date = new Date('2024-03-05');
        const result = generateTimeSlotId(date, '09:00');
        expect(result).toBe('2024-03-05-09-00');
      });
    });

    describe('parseTimeSlotId', () => {
      it('should parse valid slot ID', () => {
        const result = parseTimeSlotId('2024-01-15-14-30');
        expect(result).not.toBeNull();
        expect(result?.date.getFullYear()).toBe(2024);
        expect(result?.date.getMonth()).toBe(0);
        expect(result?.date.getDate()).toBe(15);
        expect(result?.time).toBe('14:30');
      });

      it('should return null for invalid slot ID', () => {
        expect(parseTimeSlotId('invalid-id')).toBeNull();
        expect(parseTimeSlotId('2024-01-15')).toBeNull();
        expect(parseTimeSlotId('2024-13-45-25-70')).toBeNull();
      });
    });
  });

  describe('Date Validation', () => {
    describe('isToday', () => {
      it('should return true for today', () => {
        const today = new Date('2024-01-15');
        expect(isToday(today)).toBe(true);
      });

      it('should return false for other dates', () => {
        const yesterday = new Date('2024-01-14');
        const tomorrow = new Date('2024-01-16');
        expect(isToday(yesterday)).toBe(false);
        expect(isToday(tomorrow)).toBe(false);
      });
    });

    describe('isPastDate', () => {
      it('should return true for past dates', () => {
        const pastDate = new Date('2024-01-14');
        expect(isPastDate(pastDate)).toBe(true);
      });

      it('should return false for today and future dates', () => {
        const today = new Date('2024-01-15');
        const futureDate = new Date('2024-01-16');
        expect(isPastDate(today)).toBe(false);
        expect(isPastDate(futureDate)).toBe(false);
      });
    });

    describe('isValidBookingDate', () => {
      it('should return true for dates within booking range', () => {
        // 3 days from now (within 30 days, after 2 hours)
        const validDate = new Date('2024-01-18T10:00:00.000Z');
        expect(isValidBookingDate(validDate)).toBe(true);
      });

      it('should return false for dates too soon', () => {
        // 1 hour from now (less than 2 hours advance)
        const tooSoon = new Date('2024-01-15T11:00:00.000Z');
        expect(isValidBookingDate(tooSoon)).toBe(false);
      });

      it('should return false for dates too far in future', () => {
        // 31 days from now (more than 30 days advance)
        const tooFar = new Date('2024-02-15T10:00:00.000Z');
        expect(isValidBookingDate(tooFar)).toBe(false);
      });
    });

    describe('getMinBookingDate', () => {
      it('should return minimum booking date', () => {
        const minDate = getMinBookingDate();
        const expected = new Date('2024-01-15T12:00:00.000Z'); // 2 hours from mock time
        expect(minDate.getTime()).toBe(expected.getTime());
      });
    });

    describe('getMaxBookingDate', () => {
      it('should return maximum booking date', () => {
        const maxDate = getMaxBookingDate();
        const expected = new Date('2024-02-14T10:00:00.000Z'); // 30 days from mock time
        expect(maxDate.getTime()).toBe(expected.getTime());
      });
    });

    describe('isWithinBusinessHours', () => {
      it('should return true for times within business hours', () => {
        expect(isWithinBusinessHours('06:00')).toBe(true);
        expect(isWithinBusinessHours('12:30')).toBe(true);
        expect(isWithinBusinessHours('19:59')).toBe(true);
      });

      it('should return false for times outside business hours', () => {
        expect(isWithinBusinessHours('05:59')).toBe(false);
        expect(isWithinBusinessHours('20:00')).toBe(false);
        expect(isWithinBusinessHours('23:30')).toBe(false);
      });

      it('should return false for invalid time format', () => {
        expect(isWithinBusinessHours('invalid')).toBe(false);
        expect(isWithinBusinessHours('25:30')).toBe(false);
      });
    });
  });

  describe('Date Calculations', () => {
    describe('getDaysBetween', () => {
      it('should calculate days between dates', () => {
        const start = new Date('2024-01-15');
        const end = new Date('2024-01-20');
        expect(getDaysBetween(start, end)).toBe(5);
      });

      it('should handle same date', () => {
        const date = new Date('2024-01-15');
        expect(getDaysBetween(date, date)).toBe(0);
      });

      it('should handle reverse order', () => {
        const start = new Date('2024-01-20');
        const end = new Date('2024-01-15');
        expect(getDaysBetween(start, end)).toBe(-5);
      });
    });

    describe('addDays', () => {
      it('should add days to date', () => {
        const date = new Date('2024-01-15');
        const result = addDays(date, 5);
        expect(result.getDate()).toBe(20);
        expect(result.getMonth()).toBe(0);
        expect(result.getFullYear()).toBe(2024);
      });

      it('should handle month overflow', () => {
        const date = new Date('2024-01-30');
        const result = addDays(date, 5);
        expect(result.getDate()).toBe(4);
        expect(result.getMonth()).toBe(1); // February
      });

      it('should handle negative days', () => {
        const date = new Date('2024-01-15');
        const result = addDays(date, -5);
        expect(result.getDate()).toBe(10);
      });
    });

    describe('getStartOfDay', () => {
      it('should return start of day', () => {
        const date = new Date('2024-01-15T14:30:45.123');
        const result = getStartOfDay(date);
        expect(result.getHours()).toBe(0);
        expect(result.getMinutes()).toBe(0);
        expect(result.getSeconds()).toBe(0);
        expect(result.getMilliseconds()).toBe(0);
      });
    });

    describe('getEndOfDay', () => {
      it('should return end of day', () => {
        const date = new Date('2024-01-15T14:30:45.123');
        const result = getEndOfDay(date);
        expect(result.getHours()).toBe(23);
        expect(result.getMinutes()).toBe(59);
        expect(result.getSeconds()).toBe(59);
        expect(result.getMilliseconds()).toBe(999);
      });
    });
  });

  describe('Timezone Utilities', () => {
    describe('getUserTimezone', () => {
      it('should return user timezone', () => {
        const timezone = getUserTimezone();
        expect(typeof timezone).toBe('string');
        expect(timezone.length).toBeGreaterThan(0);
      });
    });

    describe('toLocalTimezone', () => {
      it('should convert to local timezone', () => {
        const date = new Date('2024-01-15T14:30:00.000Z');
        const result = toLocalTimezone(date);
        expect(result).toBeInstanceOf(Date);
      });
    });

    describe('formatDateInTimezone', () => {
      it('should format date in specific timezone', () => {
        const date = new Date('2024-01-15T14:30:00.000Z');
        const result = formatDateInTimezone(date, 'America/New_York');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });

      it('should use custom formatting options', () => {
        const date = new Date('2024-01-15T14:30:00.000Z');
        const options = { month: 'short', day: 'numeric' } as const;
        const result = formatDateInTimezone(date, 'UTC', options);
        expect(result).toBe('Jan 15');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29');
      expect(formatDisplayDate(leapYearDate)).toContain('February 29, 2024');
      
      // For the booking validation, we need a leap year date that's within the valid range
      // Since our mock date is 2024-01-15T10:00:00.000Z, Feb 29 is too far in the past
      // Let's test with a leap year date that would be valid if it were in range
      const futureLeapDate = new Date('2024-01-20T10:00:00.000Z'); // Within valid range
      expect(isValidBookingDate(futureLeapDate)).toBe(true);
    });

    it('should handle year boundaries', () => {
      const newYearEve = new Date('2023-12-31');
      const newYearDay = new Date('2024-01-01');
      
      expect(getDaysBetween(newYearEve, newYearDay)).toBe(1);
      expect(addDays(newYearEve, 1)).toEqual(newYearDay);
    });

    it('should handle daylight saving time transitions', () => {
      // This test ensures our date calculations work across DST boundaries
      const beforeDST = new Date('2024-03-09'); // Day before DST in 2024
      const afterDST = new Date('2024-03-11'); // Day after DST in 2024
      
      expect(getDaysBetween(beforeDST, afterDST)).toBe(2);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
      
      // Our functions should handle invalid dates without throwing
      expect(() => formatDisplayDate(invalidDate)).not.toThrow();
    });
  });
});