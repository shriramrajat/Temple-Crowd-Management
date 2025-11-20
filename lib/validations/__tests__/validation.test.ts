/**
 * Validation Tests
 * Tests for validation schemas and utility functions
 */

import { describe, it, expect } from "@jest/globals";
import {
  validatePhoneNumber,
  validateEmail,
  bookingFormSchema,
  slotConfigSchema,
  updateSlotSchema,
  qrCodeDataSchema,
  adminBookingsQuerySchema,
} from "../index";

describe("Phone Number Validation", () => {
  it("should validate correct Indian phone numbers", () => {
    expect(validatePhoneNumber("9876543210")).toBe(true);
    expect(validatePhoneNumber("8765432109")).toBe(true);
    expect(validatePhoneNumber("7654321098")).toBe(true);
    expect(validatePhoneNumber("6543210987")).toBe(true);
  });

  it("should reject invalid phone numbers", () => {
    expect(validatePhoneNumber("1234567890")).toBe(false); // Starts with 1
    expect(validatePhoneNumber("5432109876")).toBe(false); // Starts with 5
    expect(validatePhoneNumber("987654321")).toBe(false); // Only 9 digits
    expect(validatePhoneNumber("98765432100")).toBe(false); // 11 digits
    expect(validatePhoneNumber("abcdefghij")).toBe(false); // Letters
    expect(validatePhoneNumber("")).toBe(false); // Empty
  });
});

describe("Email Validation", () => {
  it("should validate correct email addresses", () => {
    expect(validateEmail("test@example.com")).toBe(true);
    expect(validateEmail("user.name@domain.co.in")).toBe(true);
    expect(validateEmail("admin+tag@temple.org")).toBe(true);
  });

  it("should reject invalid email addresses", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("user @example.com")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });
});

describe("Booking Form Schema", () => {
  it("should validate correct booking data", () => {
    const validData = {
      name: "John Doe",
      phone: "9876543210",
      email: "john@example.com",
      numberOfPeople: 3,
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = bookingFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid name", () => {
    const invalidData = {
      name: "J", // Too short
      phone: "9876543210",
      email: "john@example.com",
      numberOfPeople: 3,
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = bookingFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid phone number", () => {
    const invalidData = {
      name: "John Doe",
      phone: "1234567890", // Doesn't start with 6-9
      email: "john@example.com",
      numberOfPeople: 3,
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = bookingFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid number of people", () => {
    const invalidData = {
      name: "John Doe",
      phone: "9876543210",
      email: "john@example.com",
      numberOfPeople: 15, // Exceeds max of 10
      slotId: "123e4567-e89b-12d3-a456-426614174000",
    };

    const result = bookingFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Slot Config Schema", () => {
  it("should validate correct slot configuration", () => {
    const validData = {
      date: new Date("2025-01-01"),
      startTime: "09:00",
      endTime: "10:00",
      capacity: 50,
      isActive: true,
    };

    const result = slotConfigSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject end time before start time", () => {
    const invalidData = {
      date: new Date("2025-01-01"),
      startTime: "10:00",
      endTime: "09:00", // Before start time
      capacity: 50,
      isActive: true,
    };

    const result = slotConfigSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid time format", () => {
    const invalidData = {
      date: new Date("2025-01-01"),
      startTime: "9:00", // Missing leading zero
      endTime: "10:00",
      capacity: 50,
      isActive: true,
    };

    const result = slotConfigSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid capacity", () => {
    const invalidData = {
      date: new Date("2025-01-01"),
      startTime: "09:00",
      endTime: "10:00",
      capacity: 0, // Must be at least 1
      isActive: true,
    };

    const result = slotConfigSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Update Slot Schema", () => {
  it("should validate partial updates", () => {
    const validData = {
      capacity: 75,
    };

    const result = updateSlotSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should validate time updates", () => {
    const validData = {
      startTime: "08:00",
      endTime: "09:00",
    };

    const result = updateSlotSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid time relationship in updates", () => {
    const invalidData = {
      startTime: "10:00",
      endTime: "09:00",
    };

    const result = updateSlotSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("QR Code Data Schema", () => {
  it("should validate correct QR code data", () => {
    const validData = {
      bookingId: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      date: "2025-01-01T09:00:00.000Z",
      slotTime: "09:00-10:00",
      numberOfPeople: 3,
      timestamp: 1704096000000,
    };

    const result = qrCodeDataSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid slot time format", () => {
    const invalidData = {
      bookingId: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      date: "2025-01-01T09:00:00.000Z",
      slotTime: "9:00-10:00", // Missing leading zero
      numberOfPeople: 3,
      timestamp: 1704096000000,
    };

    const result = qrCodeDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("Admin Bookings Query Schema", () => {
  it("should validate correct query parameters", () => {
    const validData = {
      date: "2025-01-01",
      status: "confirmed" as const,
      search: "John",
      page: 1,
      limit: 20,
    };

    const result = adminBookingsQuerySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should apply default values", () => {
    const minimalData = {};

    const result = adminBookingsQuerySchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should reject invalid date format", () => {
    const invalidData = {
      date: "01-01-2025", // Wrong format
    };

    const result = adminBookingsQuerySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should reject invalid status", () => {
    const invalidData = {
      status: "pending", // Not a valid status
    };

    const result = adminBookingsQuerySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
