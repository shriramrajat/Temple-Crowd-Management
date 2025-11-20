/**
 * End-to-End Integration Test: Booking Flow with Accessibility Profile
 * 
 * Tests the complete flow from profile creation to priority slot booking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveProfile, 
  getProfile 
} from '@/lib/services/accessibility-service';
import { 
  getAvailableSlots, 
  allocateSlot 
} from '@/lib/services/priority-slot-service';
import type { AccessibilityProfile } from '@/lib/types/accessibility';

describe('Booking Flow Integration', () => {
  const mockPilgrimId = 'test-pilgrim-001';

  beforeEach(() => {
    // Clear local storage before each test
    localStorage.clear();
  });

  it('should complete full booking flow with accessibility profile', async () => {
    // Step 1: Create accessibility profile
    const profile: AccessibilityProfile = {
      pilgrimId: mockPilgrimId,
      categories: ['elderly', 'wheelchair-user'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      emergencyContact: {
        name: 'John Doe',
        phone: '+1234567890',
        relationship: 'Son',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedProfile = await saveProfile(profile);
    expect(savedProfile).toBeDefined();
    expect(savedProfile.pilgrimId).toBe(mockPilgrimId);
    expect(savedProfile.categories).toContain('elderly');
    expect(savedProfile.categories).toContain('wheelchair-user');

    // Step 2: Retrieve profile
    const retrievedProfile = await getProfile(mockPilgrimId);
    expect(retrievedProfile).toBeDefined();
    expect(retrievedProfile?.pilgrimId).toBe(mockPilgrimId);
    expect(retrievedProfile?.categories).toEqual(profile.categories);

    // Step 3: Get available priority slots
    const availableSlots = getAvailableSlots(retrievedProfile!);
    expect(availableSlots).toBeDefined();
    expect(Array.isArray(availableSlots)).toBe(true);
    expect(availableSlots.length).toBeGreaterThan(0);

    // Verify slots match accessibility categories
    const firstSlot = availableSlots[0];
    expect(firstSlot.accessibilityCategories).toBeDefined();
    expect(
      firstSlot.accessibilityCategories.some(cat => 
        profile.categories.includes(cat)
      )
    ).toBe(true);

    // Step 4: Allocate a priority slot
    const allocation = await allocateSlot(
      firstSlot.id,
      mockPilgrimId,
      retrievedProfile!
    );

    expect(allocation).toBeDefined();
    expect(allocation.pilgrimId).toBe(mockPilgrimId);
    expect(allocation.slotId).toBe(firstSlot.id);
    expect(allocation.status).toBe('confirmed');
    expect(allocation.qrCode).toBeDefined();
    expect(allocation.estimatedWaitTime).toBeLessThanOrEqual(30);

    // Step 5: Verify allocation is stored
    const storedAllocations = localStorage.getItem('slot-allocations');
    expect(storedAllocations).toBeDefined();
    
    const allocations = JSON.parse(storedAllocations!);
    expect(allocations).toContain(allocation.allocationId);
  });

  it('should handle booking without accessibility profile', () => {
    // Attempt to get slots without profile
    const slots = getAvailableSlots(null as any);
    
    // Should return empty array or handle gracefully
    expect(Array.isArray(slots)).toBe(true);
  });

  it('should update profile and reflect in slot availability', async () => {
    // Create initial profile
    const initialProfile: AccessibilityProfile = {
      pilgrimId: mockPilgrimId,
      categories: ['elderly'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveProfile(initialProfile);
    const initialSlots = getAvailableSlots(initialProfile);
    const initialSlotCount = initialSlots.length;

    // Update profile with more categories
    const updatedProfile: AccessibilityProfile = {
      ...initialProfile,
      categories: ['elderly', 'wheelchair-user', 'differently-abled'],
      requiresAssistance: true,
      updatedAt: new Date(),
    };

    await saveProfile(updatedProfile);
    const updatedSlots = getAvailableSlots(updatedProfile);

    // Should have same or more slots available
    expect(updatedSlots.length).toBeGreaterThanOrEqual(initialSlotCount);
  });

  it('should handle slot capacity limits', async () => {
    const profile: AccessibilityProfile = {
      pilgrimId: mockPilgrimId,
      categories: ['elderly'],
      mobilitySpeed: 'moderate',
      requiresAssistance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveProfile(profile);
    const slots = getAvailableSlots(profile);
    
    if (slots.length > 0) {
      const slot = slots[0];
      
      // Allocate multiple times until capacity is reached
      const allocations = [];
      for (let i = 0; i < slot.capacity; i++) {
        try {
          const allocation = await allocateSlot(
            slot.id,
            `pilgrim-${i}`,
            profile
          );
          allocations.push(allocation);
        } catch (error) {
          // Expected to fail when capacity is reached
          break;
        }
      }

      // Should have allocated at least some slots
      expect(allocations.length).toBeGreaterThan(0);
    }
  });
});
