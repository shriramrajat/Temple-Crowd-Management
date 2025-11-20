/**
 * Slot Management Service
 * Handles all business logic related to slot management including
 * availability calculation, crowd level determination, and slot CRUD operations
 */

import type { CrowdLevel, SlotAvailability, SlotConfig } from "@/lib/types/api";
import type { SlotConfigData } from "@/lib/validations/slot";
import type { DbClient } from "@/lib/db";

/**
 * Slot data structure from database
 */
export interface SlotData {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculate crowd level based on booking percentage
 * Requirements: 3.2, 3.3, 3.4, 3.5
 * 
 * @param bookedCount - Number of bookings for the slot
 * @param capacity - Total capacity of the slot
 * @returns Crowd level indicator
 */
export function calculateCrowdLevel(
  bookedCount: number,
  capacity: number
): CrowdLevel {
  if (capacity === 0) return "full";
  
  const percentage = (bookedCount / capacity) * 100;

  if (percentage >= 100) return "full";
  if (percentage > 66) return "high";
  if (percentage >= 33) return "medium";
  return "low";
}

/**
 * Transform database slot to API response format
 * 
 * @param slot - Slot data from database
 * @returns Formatted slot availability
 */
export function transformSlotToAvailability(slot: SlotData): SlotAvailability {
  const crowdLevel = calculateCrowdLevel(slot.bookedCount, slot.capacity);
  const isAvailable = slot.isActive && slot.bookedCount < slot.capacity;

  return {
    id: slot.id,
    date: slot.date.toISOString().split("T")[0], // YYYY-MM-DD format
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    bookedCount: slot.bookedCount,
    crowdLevel,
    isAvailable,
    isActive: slot.isActive,
  };
}

/**
 * Transform database slot to admin config format
 * 
 * @param slot - Slot data from database
 * @returns Formatted slot configuration
 */
export function transformSlotToConfig(slot: SlotData): SlotConfig {
  return {
    id: slot.id,
    date: slot.date.toISOString().split("T")[0],
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    bookedCount: slot.bookedCount,
    isActive: slot.isActive,
    createdAt: slot.createdAt.toISOString(),
    updatedAt: slot.updatedAt.toISOString(),
  };
}

/**
 * Slot Management Service Class
 * Provides methods for slot operations with database abstraction
 */
export class SlotService {
  /**
   * Database client instance
   */
  private db: DbClient;

  constructor(dbClient: DbClient) {
    this.db = dbClient;
  }

  /**
   * Get available slots for a specific date
   * Requirements: 1.1, 1.2
   * 
   * @param date - Date to fetch slots for
   * @returns Array of slot availability data
   */
  async getAvailableSlots(date: Date): Promise<SlotAvailability[]> {
    // Normalize date to start of day in UTC
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Fetch slots from database
    const slots = await this.db.slots.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Transform to API format
    return slots.map(transformSlotToAvailability);
  }

  /**
   * Create a new slot configuration
   * Requirements: 7.2
   * 
   * @param config - Slot configuration data
   * @returns Created slot
   */
  async createSlot(config: SlotConfigData): Promise<SlotConfig> {
    // Normalize date to start of day
    const slotDate = new Date(config.date);
    slotDate.setUTCHours(0, 0, 0, 0);

    // Check for duplicate slot (same date and time)
    const existingSlot = await this.db.slots.findFirst({
      where: {
        date: slotDate,
        startTime: config.startTime,
        endTime: config.endTime,
      },
    });

    if (existingSlot) {
      throw new Error(
        `A slot already exists for ${config.date} from ${config.startTime} to ${config.endTime}`
      );
    }

    // Generate unique ID
    const slotId = `slot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create new slot
    const slot = await this.db.slots.create({
      data: {
        id: slotId,
        date: slotDate,
        startTime: config.startTime,
        endTime: config.endTime,
        capacity: config.capacity,
        bookedCount: 0,
        isActive: config.isActive ?? true,
        updatedAt: new Date(),
      },
    });

    return transformSlotToConfig(slot);
  }

  /**
   * Update slot capacity with validation
   * Requirements: 7.3
   * 
   * Ensures new capacity is not less than current booked count
   * to protect existing bookings
   * 
   * @param slotId - ID of the slot to update
   * @param newCapacity - New capacity value
   * @returns Updated slot
   */
  async updateSlotCapacity(
    slotId: string,
    newCapacity: number
  ): Promise<SlotConfig> {
    // Fetch current slot
    const slot = await this.db.slots.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error(`Slot with ID ${slotId} not found`);
    }

    // Validate new capacity against existing bookings
    if (newCapacity < slot.bookedCount) {
      throw new Error(
        `Cannot reduce capacity to ${newCapacity}. Current bookings: ${slot.bookedCount}. ` +
        `New capacity must be at least ${slot.bookedCount}.`
      );
    }

    // Update capacity
    const updatedSlot = await this.db.slots.update({
      where: { id: slotId },
      data: { 
        capacity: newCapacity,
        updatedAt: new Date(),
      },
    });

    return transformSlotToConfig(updatedSlot);
  }

  /**
   * Update booked count atomically
   * Requirements: 7.2, 7.3, 7.4
   * 
   * Uses atomic increment/decrement to prevent race conditions
   * 
   * @param slotId - ID of the slot to update
   * @param delta - Amount to change (positive for increment, negative for decrement)
   * @returns Updated slot
   */
  async updateBookedCount(slotId: string, delta: number): Promise<SlotConfig> {
    // Validate slot exists and has sufficient capacity
    const slot = await this.db.slots.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error(`Slot with ID ${slotId} not found`);
    }

    // Prevent negative booked count
    if (slot.bookedCount + delta < 0) {
      throw new Error(
        `Cannot decrement booked count below 0. Current: ${slot.bookedCount}, Delta: ${delta}`
      );
    }

    // Prevent exceeding capacity
    if (slot.bookedCount + delta > slot.capacity) {
      throw new Error(
        `Cannot exceed slot capacity. Capacity: ${slot.capacity}, ` +
        `Current bookings: ${slot.bookedCount}, Attempting to add: ${delta}`
      );
    }

    // Atomic update using increment
    const updatedSlot = await this.db.slots.update({
      where: { id: slotId },
      data: {
        bookedCount: {
          increment: delta,
        },
        updatedAt: new Date(),
      },
    });

    return transformSlotToConfig(updatedSlot);
  }

  /**
   * Update slot configuration
   * Requirements: 7.3
   * 
   * @param slotId - ID of the slot to update
   * @param updates - Partial slot configuration updates
   * @returns Updated slot
   */
  async updateSlot(
    slotId: string,
    updates: Partial<SlotConfigData>
  ): Promise<SlotConfig> {
    // If capacity is being updated, use the protected method
    if (updates.capacity !== undefined) {
      return this.updateSlotCapacity(slotId, updates.capacity);
    }

    // Fetch current slot for validation
    const slot = await this.db.slots.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error(`Slot with ID ${slotId} not found`);
    }

    // Build update data
    const updateData: any = {};
    if (updates.startTime !== undefined) updateData.startTime = updates.startTime;
    if (updates.endTime !== undefined) updateData.endTime = updates.endTime;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    // Update slot
    const updatedSlot = await this.db.slots.update({
      where: { id: slotId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });

    return transformSlotToConfig(updatedSlot);
  }

  /**
   * Delete a slot
   * Requirements: 7.4
   * 
   * Prevents deletion if bookings exist
   * 
   * @param slotId - ID of the slot to delete
   */
  async deleteSlot(slotId: string): Promise<void> {
    // Check if slot exists
    const slot = await this.db.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new Error(`Slot with ID ${slotId} not found`);
    }

    // Prevent deletion if bookings exist
    if (slot.bookedCount > 0) {
      throw new Error(
        `Cannot delete slot with existing bookings. ` +
        `Current bookings: ${slot.bookedCount}. ` +
        `Please cancel all bookings first or disable the slot instead.`
      );
    }

    // Delete slot
    await this.db.slot.delete({
      where: { id: slotId },
    });
  }

  /**
   * Get slot by ID
   * 
   * @param slotId - ID of the slot
   * @returns Slot configuration or null
   */
  async getSlotById(slotId: string): Promise<SlotConfig | null> {
    const slot = await this.db.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) return null;

    return transformSlotToConfig(slot);
  }

  /**
   * Get all slots (admin view)
   * Requirements: 7.2
   * 
   * @param filters - Optional filters for date range, active status
   * @returns Array of slot configurations
   */
  async getAllSlots(filters?: {
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }): Promise<SlotConfig[]> {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const slots = await this.db.slot.findMany({
      where,
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return slots.map(transformSlotToConfig);
  }

  /**
   * Check if a slot is available for booking
   * Requirements: 1.3, 1.4
   * 
   * @param slotId - ID of the slot
   * @returns Boolean indicating availability
   */
  async isSlotAvailable(slotId: string): Promise<boolean> {
    const slot = await this.db.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) return false;

    return slot.isActive && slot.bookedCount < slot.capacity;
  }
}
