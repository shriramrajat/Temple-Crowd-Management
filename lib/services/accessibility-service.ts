/**
 * Accessibility Service
 * 
 * Handles accessibility profile management including storage, retrieval,
 * and validation of pilgrim accessibility data.
 */

import { 
  AccessibilityProfile, 
  AccessibilityPreferences 
} from '@/lib/types/accessibility'
import { 
  AccessibilityProfileSchema,
  AccessibilityPreferencesSchema 
} from '@/lib/schemas/accessibility'

const STORAGE_KEY_PREFIX = 'accessibility_profile_'
const PREFERENCES_KEY_PREFIX = 'accessibility_preferences_'

/**
 * Save accessibility profile to local storage
 * @param profile - The accessibility profile to save
 * @returns Promise resolving to the saved profile
 */
export async function saveProfile(
  profile: AccessibilityProfile
): Promise<AccessibilityProfile> {
  try {
    // Validate profile data
    const validatedProfile = AccessibilityProfileSchema.parse(profile)
    
    // Update timestamp
    validatedProfile.updatedAt = new Date()
    
    // Store in local storage
    const key = `${STORAGE_KEY_PREFIX}${validatedProfile.pilgrimId}`
    localStorage.setItem(key, JSON.stringify(validatedProfile))
    
    return validatedProfile
  } catch (error) {
    console.error('Error saving accessibility profile:', error)
    throw new Error('Failed to save accessibility profile')
  }
}

/**
 * Retrieve accessibility profile from local storage
 * @param pilgrimId - The ID of the pilgrim
 * @returns Promise resolving to the profile or null if not found
 */
export async function getProfile(
  pilgrimId: string
): Promise<AccessibilityProfile | null> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${pilgrimId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      return null
    }
    
    const parsed = JSON.parse(stored)
    
    // Convert date strings back to Date objects
    parsed.createdAt = new Date(parsed.createdAt)
    parsed.updatedAt = new Date(parsed.updatedAt)
    
    // Validate retrieved data
    const validatedProfile = AccessibilityProfileSchema.parse(parsed)
    
    return validatedProfile
  } catch (error) {
    console.error('Error retrieving accessibility profile:', error)
    return null
  }
}

/**
 * Update accessibility profile
 * @param pilgrimId - The ID of the pilgrim
 * @param updates - Partial profile data to update
 * @returns Promise resolving to the updated profile
 */
export async function updateProfile(
  pilgrimId: string,
  updates: Partial<Omit<AccessibilityProfile, 'pilgrimId' | 'createdAt' | 'updatedAt'>>
): Promise<AccessibilityProfile> {
  try {
    // Get existing profile
    const existingProfile = await getProfile(pilgrimId)
    
    if (!existingProfile) {
      throw new Error('Profile not found')
    }
    
    // Merge updates with existing profile
    const updatedProfile: AccessibilityProfile = {
      ...existingProfile,
      ...updates,
      pilgrimId, // Ensure pilgrimId doesn't change
      updatedAt: new Date(),
    }
    
    // Save and return updated profile
    return await saveProfile(updatedProfile)
  } catch (error) {
    console.error('Error updating accessibility profile:', error)
    throw new Error('Failed to update accessibility profile')
  }
}

/**
 * Delete accessibility profile
 * @param pilgrimId - The ID of the pilgrim
 * @returns Promise resolving to true if deleted successfully
 */
export async function deleteProfile(pilgrimId: string): Promise<boolean> {
  try {
    const key = `${STORAGE_KEY_PREFIX}${pilgrimId}`
    localStorage.removeItem(key)
    
    // Also remove preferences
    const prefsKey = `${PREFERENCES_KEY_PREFIX}${pilgrimId}`
    localStorage.removeItem(prefsKey)
    
    return true
  } catch (error) {
    console.error('Error deleting accessibility profile:', error)
    return false
  }
}

/**
 * Save accessibility preferences
 * @param pilgrimId - The ID of the pilgrim
 * @param preferences - The preferences to save
 * @returns Promise resolving to the saved preferences
 */
export async function savePreferences(
  pilgrimId: string,
  preferences: AccessibilityPreferences
): Promise<AccessibilityPreferences> {
  try {
    // Validate preferences
    const validatedPreferences = AccessibilityPreferencesSchema.parse(preferences)
    
    // Store in local storage
    const key = `${PREFERENCES_KEY_PREFIX}${pilgrimId}`
    localStorage.setItem(key, JSON.stringify(validatedPreferences))
    
    return validatedPreferences
  } catch (error) {
    console.error('Error saving accessibility preferences:', error)
    throw new Error('Failed to save accessibility preferences')
  }
}

/**
 * Retrieve accessibility preferences
 * @param pilgrimId - The ID of the pilgrim
 * @returns Promise resolving to the preferences or default preferences if not found
 */
export async function getPreferences(
  pilgrimId: string
): Promise<AccessibilityPreferences> {
  try {
    const key = `${PREFERENCES_KEY_PREFIX}${pilgrimId}`
    const stored = localStorage.getItem(key)
    
    if (!stored) {
      // Return default preferences
      return {
        notifyOnAssistanceZone: true,
        prioritySlotReminders: true,
        weatherAlerts: true,
        routeRecalculationAlerts: true,
      }
    }
    
    const parsed = JSON.parse(stored)
    const validatedPreferences = AccessibilityPreferencesSchema.parse(parsed)
    
    return validatedPreferences
  } catch (error) {
    console.error('Error retrieving accessibility preferences:', error)
    // Return default preferences on error
    return {
      notifyOnAssistanceZone: true,
      prioritySlotReminders: true,
      weatherAlerts: true,
      routeRecalculationAlerts: true,
    }
  }
}

/**
 * Check if a pilgrim has an accessibility profile
 * @param pilgrimId - The ID of the pilgrim
 * @returns Promise resolving to true if profile exists
 */
export async function hasProfile(pilgrimId: string): Promise<boolean> {
  const profile = await getProfile(pilgrimId)
  return profile !== null
}

/**
 * Validate profile data without saving
 * @param profile - The profile data to validate
 * @returns Validation result with success status and errors if any
 */
export function validateProfileData(
  profile: Partial<AccessibilityProfile>
): { success: boolean; errors?: string[] } {
  try {
    AccessibilityProfileSchema.parse(profile)
    return { success: true }
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => e.message) || ['Validation failed']
    return { success: false, errors }
  }
}

/**
 * Get all stored profile IDs (for admin/debugging purposes)
 * @returns Array of pilgrim IDs with stored profiles
 */
export function getAllProfileIds(): string[] {
  const ids: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const id = key.replace(STORAGE_KEY_PREFIX, '')
      ids.push(id)
    }
  }
  
  return ids
}
