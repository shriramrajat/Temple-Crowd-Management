/**
 * Priority Slot Mock Data
 * 
 * This file contains mock data for priority darshan slots with various time slots,
 * capacity tracking, and quota calculation logic.
 */

import type { PrioritySlot, SlotQuota, SlotAllocation } from '../types/priority-slots';
import type { AccessibilityCategory } from '../types/accessibility';

/**
 * Calculate slot quota based on total capacity
 * Ensures minimum 20% reservation for priority slots
 */
export function calculateSlotQuota(totalCapacity: number, priorityUsed: number = 0): SlotQuota {
  const priorityReserved = Math.ceil(totalCapacity * 0.2); // 20% minimum
  const generalCapacity = totalCapacity - priorityReserved;
  const utilizationRate = priorityReserved > 0 
    ? Math.round((priorityUsed / priorityReserved) * 100) 
    : 0;

  return {
    totalCapacity,
    priorityReserved,
    priorityUsed,
    generalCapacity,
    utilizationRate,
  };
}

/**
 * Generate mock priority slots for various time slots throughout the day
 */
export function generateMockPrioritySlots(date: Date = new Date()): PrioritySlot[] {
  const slots: PrioritySlot[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(6, 0, 0, 0); // Start at 6 AM

  // Morning slots (6 AM - 12 PM)
  const morningSlots = [
    { hour: 6, minute: 0, capacity: 100, reserved: 15, categories: ['elderly', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 7, minute: 0, capacity: 120, reserved: 20, categories: ['elderly', 'differently-abled'] as AccessibilityCategory[] },
    { hour: 8, minute: 0, capacity: 150, reserved: 30, categories: ['elderly', 'differently-abled', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 9, minute: 0, capacity: 150, reserved: 28, categories: ['elderly', 'differently-abled', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 10, minute: 0, capacity: 140, reserved: 25, categories: ['elderly', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 11, minute: 0, capacity: 130, reserved: 22, categories: ['elderly', 'differently-abled'] as AccessibilityCategory[] },
  ];

  // Afternoon slots (12 PM - 6 PM)
  const afternoonSlots = [
    { hour: 12, minute: 0, capacity: 120, reserved: 18, categories: ['elderly', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 13, minute: 0, capacity: 110, reserved: 15, categories: ['elderly', 'differently-abled'] as AccessibilityCategory[] },
    { hour: 14, minute: 0, capacity: 100, reserved: 12, categories: ['wheelchair-user'] as AccessibilityCategory[] },
    { hour: 15, minute: 0, capacity: 110, reserved: 16, categories: ['elderly', 'differently-abled', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 16, minute: 0, capacity: 120, reserved: 20, categories: ['elderly', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 17, minute: 0, capacity: 130, reserved: 24, categories: ['elderly', 'differently-abled'] as AccessibilityCategory[] },
  ];

  // Evening slots (6 PM - 9 PM)
  const eveningSlots = [
    { hour: 18, minute: 0, capacity: 140, reserved: 26, categories: ['elderly', 'differently-abled', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 19, minute: 0, capacity: 130, reserved: 22, categories: ['elderly', 'wheelchair-user'] as AccessibilityCategory[] },
    { hour: 20, minute: 0, capacity: 120, reserved: 18, categories: ['elderly', 'differently-abled'] as AccessibilityCategory[] },
  ];

  // Women-only slots
  const womenOnlySlots = [
    { hour: 7, minute: 30, capacity: 80, reserved: 10, categories: ['women-only-route', 'elderly'] as AccessibilityCategory[] },
    { hour: 10, minute: 30, capacity: 80, reserved: 12, categories: ['women-only-route', 'elderly'] as AccessibilityCategory[] },
    { hour: 14, minute: 30, capacity: 80, reserved: 8, categories: ['women-only-route'] as AccessibilityCategory[] },
    { hour: 17, minute: 30, capacity: 80, reserved: 14, categories: ['women-only-route', 'elderly'] as AccessibilityCategory[] },
  ];

  const allSlots = [...morningSlots, ...afternoonSlots, ...eveningSlots, ...womenOnlySlots];

  allSlots.forEach((slotConfig, index) => {
    const slotTime = new Date(baseDate);
    slotTime.setHours(slotConfig.hour, slotConfig.minute, 0, 0);

    const available = slotConfig.capacity - slotConfig.reserved;
    let status: 'available' | 'filling' | 'full' = 'available';
    
    if (slotConfig.reserved >= slotConfig.capacity) {
      status = 'full';
    } else if (slotConfig.reserved >= slotConfig.capacity * 0.8) {
      status = 'filling';
    }

    const location = slotConfig.categories.includes('women-only-route')
      ? 'Women-Only Darshan Hall'
      : 'Main Darshan Hall';

    slots.push({
      id: `slot-${date.toISOString().split('T')[0]}-${index + 1}`,
      slotTime,
      duration: 60, // 60 minutes per slot
      capacity: slotConfig.capacity,
      reserved: slotConfig.reserved,
      available,
      accessibilityCategories: slotConfig.categories,
      location,
      status,
    });
  });

  return slots.sort((a, b) => a.slotTime.getTime() - b.slotTime.getTime());
}

/**
 * Mock slot allocations for testing
 */
export const mockSlotAllocations: SlotAllocation[] = [];

/**
 * Get current slot quota for a specific date
 */
export function getMockSlotQuota(date: Date = new Date()): SlotQuota {
  const slots = generateMockPrioritySlots(date);
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const priorityUsed = slots.reduce((sum, slot) => sum + slot.reserved, 0);
  
  return calculateSlotQuota(totalCapacity, priorityUsed);
}

/**
 * Track slot capacity and check if alert threshold is reached
 */
export function checkCapacityAlert(quota: SlotQuota): boolean {
  return quota.utilizationRate >= 80;
}

/**
 * Get slots by accessibility category
 */
export function getSlotsByCategory(
  slots: PrioritySlot[],
  category: AccessibilityCategory
): PrioritySlot[] {
  return slots.filter(slot => 
    slot.accessibilityCategories.includes(category)
  );
}

/**
 * Calculate estimated wait time for a slot
 * Peak hours (8 AM - 10 AM, 5 PM - 7 PM) have higher wait times
 */
export function calculateWaitTime(slotTime: Date, reserved: number, capacity: number): number {
  const hour = slotTime.getHours();
  const isPeakHour = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 19);
  
  const utilizationRate = reserved / capacity;
  let baseWaitTime = 10; // Base wait time in minutes
  
  if (isPeakHour) {
    baseWaitTime = 15;
  }
  
  // Increase wait time based on utilization
  const waitTime = Math.round(baseWaitTime + (utilizationRate * 15));
  
  // Ensure wait time doesn't exceed 30 minutes for priority slots
  return Math.min(waitTime, 30);
}

/**
 * Default mock data export
 */
export const mockPrioritySlots = generateMockPrioritySlots();
export const mockSlotQuota = getMockSlotQuota();
