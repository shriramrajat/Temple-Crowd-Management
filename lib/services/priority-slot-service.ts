/**
 * Priority Slot Service
 * 
 * This service manages priority darshan slot allocation, capacity monitoring,
 * and wait time calculations for pilgrims with accessibility needs.
 */

import type { 
  PrioritySlot, 
  SlotAllocation, 
  SlotQuota,
  AllocationStatus 
} from '../types/priority-slots';
import type { AccessibilityProfile, AccessibilityCategory } from '../types/accessibility';
import { 
  generateMockPrioritySlots, 
  calculateSlotQuota,
  checkCapacityAlert,
  calculateWaitTime,
  mockSlotAllocations
} from '../mock-data/priority-slots-mock';
import { triggerCapacityAlert } from './notification-triggers';

/**
 * Storage keys for local storage
 */
const STORAGE_KEYS = {
  SLOTS: 'priority-slots',
  ALLOCATIONS: 'slot-allocations',
  QUOTA: 'slot-quota',
} as const;

/**
 * Get available priority slots filtered by accessibility profile
 */
export function getAvailableSlots(
  profile: AccessibilityProfile,
  date: Date = new Date()
): PrioritySlot[] {
  // Get all slots for the date
  const allSlots = loadSlotsFromStorage(date);
  
  // Filter slots that match the pilgrim's accessibility categories
  const matchingSlots = allSlots.filter(slot => {
    // Check if slot has any matching accessibility category
    const hasMatchingCategory = slot.accessibilityCategories.some(category =>
      profile.categories.includes(category)
    );
    
    // Only return slots that are not full and match categories
    return hasMatchingCategory && slot.status !== 'full' && slot.available > 0;
  });
  
  return matchingSlots;
}

/**
 * Allocate a priority slot to a pilgrim
 */
export async function allocateSlot(
  slotId: string,
  pilgrimId: string,
  profile: AccessibilityProfile
): Promise<SlotAllocation> {
  // Load current slots and allocations
  const slots = loadSlotsFromStorage();
  const allocations = loadAllocationsFromStorage();
  
  // Find the requested slot
  const slot = slots.find(s => s.id === slotId);
  if (!slot) {
    throw new Error('Slot not found');
  }
  
  // Check if slot is available
  if (slot.available <= 0 || slot.status === 'full') {
    throw new Error('Slot is not available');
  }
  
  // Check if pilgrim already has an allocation for this slot
  const existingAllocation = allocations.find(
    a => a.pilgrimId === pilgrimId && a.slotId === slotId && a.status === 'confirmed'
  );
  if (existingAllocation) {
    throw new Error('Pilgrim already has an allocation for this slot');
  }
  
  // Check quota management
  const quota = getCurrentQuota();
  if (quota.priorityUsed >= quota.priorityReserved) {
    throw new Error('Priority slot quota exceeded');
  }
  
  // Update slot capacity
  slot.reserved += 1;
  slot.available -= 1;
  
  // Update slot status based on capacity
  if (slot.available === 0) {
    slot.status = 'full';
  } else if (slot.reserved >= slot.capacity * 0.8) {
    slot.status = 'filling';
  }
  
  // Calculate wait time
  const estimatedWaitTime = calculateWaitTime(slot.slotTime, slot.reserved, slot.capacity);
  
  // Generate QR code (simplified - in production would use a QR library)
  const qrCode = generateQRCode(slotId, pilgrimId);
  
  // Create allocation
  const allocation: SlotAllocation = {
    allocationId: `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    pilgrimId,
    slotId,
    accessibilityProfile: profile,
    bookingTime: new Date(),
    status: 'confirmed',
    qrCode,
    estimatedWaitTime,
  };
  
  // Save updated data
  allocations.push(allocation);
  saveSlotsToStorage(slots);
  saveAllocationsToStorage(allocations);
  
  // Update quota
  updateQuota(slots);
  
  // Check for capacity alerts
  const updatedQuota = getCurrentQuota();
  if (checkCapacityAlert(updatedQuota)) {
    console.warn('⚠️ Priority slot capacity alert: 80% threshold reached', updatedQuota);
    // Trigger capacity alert notification to administrators
    await triggerCapacityAlert(
      updatedQuota.utilizationRate,
      profile.categories.join(', ')
    );
  }
  
  return allocation;
}

/**
 * Get current slot quota
 */
export function getCurrentQuota(): SlotQuota {
  const stored = localStorage.getItem(STORAGE_KEYS.QUOTA);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Calculate from current slots
  const slots = loadSlotsFromStorage();
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const priorityUsed = slots.reduce((sum, slot) => sum + slot.reserved, 0);
  
  return calculateSlotQuota(totalCapacity, priorityUsed);
}

/**
 * Update quota based on current slot allocations
 */
function updateQuota(slots: PrioritySlot[]): void {
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
  const priorityUsed = slots.reduce((sum, slot) => sum + slot.reserved, 0);
  
  const quota = calculateSlotQuota(totalCapacity, priorityUsed);
  localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
}

/**
 * Monitor capacity and return alert status
 */
export function monitorCapacity(): { 
  shouldAlert: boolean; 
  quota: SlotQuota;
  message?: string;
} {
  const quota = getCurrentQuota();
  const shouldAlert = checkCapacityAlert(quota);
  
  return {
    shouldAlert,
    quota,
    message: shouldAlert 
      ? `Priority slot utilization at ${quota.utilizationRate}% - threshold exceeded`
      : undefined,
  };
}

/**
 * Get allocation by ID
 */
export function getAllocation(allocationId: string): SlotAllocation | undefined {
  const allocations = loadAllocationsFromStorage();
  return allocations.find(a => a.allocationId === allocationId);
}

/**
 * Get allocations for a pilgrim
 */
export function getPilgrimAllocations(pilgrimId: string): SlotAllocation[] {
  const allocations = loadAllocationsFromStorage();
  return allocations.filter(a => a.pilgrimId === pilgrimId);
}

/**
 * Update allocation status
 */
export function updateAllocationStatus(
  allocationId: string,
  status: AllocationStatus
): SlotAllocation {
  const allocations = loadAllocationsFromStorage();
  const allocation = allocations.find(a => a.allocationId === allocationId);
  
  if (!allocation) {
    throw new Error('Allocation not found');
  }
  
  allocation.status = status;
  saveAllocationsToStorage(allocations);
  
  return allocation;
}

/**
 * Cancel an allocation
 */
export function cancelAllocation(allocationId: string): void {
  const allocations = loadAllocationsFromStorage();
  const slots = loadSlotsFromStorage();
  
  const allocation = allocations.find(a => a.allocationId === allocationId);
  if (!allocation) {
    throw new Error('Allocation not found');
  }
  
  // Update allocation status
  allocation.status = 'cancelled';
  
  // Free up the slot
  const slot = slots.find(s => s.id === allocation.slotId);
  if (slot) {
    slot.reserved -= 1;
    slot.available += 1;
    
    // Update slot status
    if (slot.reserved < slot.capacity * 0.8) {
      slot.status = 'available';
    }
  }
  
  // Save updated data
  saveAllocationsToStorage(allocations);
  saveSlotsToStorage(slots);
  updateQuota(slots);
}

/**
 * Generate QR code string (simplified version)
 * In production, this would use a proper QR code generation library
 */
function generateQRCode(slotId: string, pilgrimId: string): string {
  const data = {
    slotId,
    pilgrimId,
    timestamp: Date.now(),
  };
  
  // Base64 encode the data
  return btoa(JSON.stringify(data));
}

/**
 * Load slots from storage or generate mock data
 */
function loadSlotsFromStorage(date: Date = new Date()): PrioritySlot[] {
  const stored = localStorage.getItem(STORAGE_KEYS.SLOTS);
  if (stored) {
    const slots = JSON.parse(stored);
    // Convert date strings back to Date objects
    return slots.map((slot: PrioritySlot) => ({
      ...slot,
      slotTime: new Date(slot.slotTime),
    }));
  }
  
  // Generate and save mock data
  const mockSlots = generateMockPrioritySlots(date);
  saveSlotsToStorage(mockSlots);
  return mockSlots;
}

/**
 * Save slots to storage
 */
function saveSlotsToStorage(slots: PrioritySlot[]): void {
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
}

/**
 * Load allocations from storage
 */
function loadAllocationsFromStorage(): SlotAllocation[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ALLOCATIONS);
  if (stored) {
    const allocations = JSON.parse(stored);
    // Convert date strings back to Date objects
    return allocations.map((alloc: SlotAllocation) => ({
      ...alloc,
      bookingTime: new Date(alloc.bookingTime),
      accessibilityProfile: {
        ...alloc.accessibilityProfile,
        createdAt: new Date(alloc.accessibilityProfile.createdAt),
        updatedAt: new Date(alloc.accessibilityProfile.updatedAt),
      },
    }));
  }
  
  return [...mockSlotAllocations];
}

/**
 * Save allocations to storage
 */
function saveAllocationsToStorage(allocations: SlotAllocation[]): void {
  localStorage.setItem(STORAGE_KEYS.ALLOCATIONS, JSON.stringify(allocations));
}

/**
 * Reset slots for a new day (utility function)
 */
export function resetSlotsForDate(date: Date): PrioritySlot[] {
  const newSlots = generateMockPrioritySlots(date);
  saveSlotsToStorage(newSlots);
  updateQuota(newSlots);
  return newSlots;
}

/**
 * Get slots by category
 */
export function getSlotsByCategory(
  category: AccessibilityCategory,
  date: Date = new Date()
): PrioritySlot[] {
  const slots = loadSlotsFromStorage(date);
  return slots.filter(slot => slot.accessibilityCategories.includes(category));
}
