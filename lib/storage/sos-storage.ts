/**
 * SOS Alert Storage Utilities
 * 
 * Provides localStorage-based storage for SOS alerts with CRUD operations,
 * filtering, and error handling for storage quota issues.
 * 
 * Requirements: 1.2, 5.1, 6.1, 7.2
 */

import { SOSAlert, AlertFilterOptions, AlertStatus, AlertType, UrgencyLevel } from '@/lib/types/sos';

const STORAGE_KEY = 'sos_alerts';
const STORAGE_VERSION = '1.0';

/**
 * Storage data structure
 */
interface StoredSOSData {
  version: string;
  alerts: SOSAlert[];
  lastUpdated: number;
}

/**
 * Storage error types
 */
export class StorageQuotaError extends Error {
  constructor(message: string = 'Storage quota exceeded') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all stored data from localStorage
 */
function getStoredData(): StoredSOSData {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    
    if (!data) {
      return {
        version: STORAGE_VERSION,
        alerts: [],
        lastUpdated: Date.now()
      };
    }

    const parsed = JSON.parse(data) as StoredSOSData;
    
    // Validate data structure
    if (!parsed.alerts || !Array.isArray(parsed.alerts)) {
      console.warn('Invalid stored data structure, resetting');
      return {
        version: STORAGE_VERSION,
        alerts: [],
        lastUpdated: Date.now()
      };
    }

    return parsed;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    throw new StorageError('Failed to read stored data');
  }
}

/**
 * Save data to localStorage
 */
function saveStoredData(data: StoredSOSData): void {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    data.lastUpdated = Date.now();
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageQuotaError('Storage quota exceeded. Please clear old alerts.');
    }
    console.error('Error writing to localStorage:', error);
    throw new StorageError('Failed to save data');
  }
}

/**
 * Save a new SOS alert
 * Requirements: 1.2
 */
export function saveAlert(alert: SOSAlert): SOSAlert {
  const data = getStoredData();
  
  // Check if alert with same ID already exists
  const existingIndex = data.alerts.findIndex(a => a.id === alert.id);
  
  if (existingIndex !== -1) {
    throw new StorageError(`Alert with ID ${alert.id} already exists`);
  }

  data.alerts.push(alert);
  saveStoredData(data);
  
  return alert;
}

/**
 * Retrieve a single alert by ID
 * Requirements: 5.1
 */
export function getAlertById(alertId: string): SOSAlert | null {
  const data = getStoredData();
  return data.alerts.find(alert => alert.id === alertId) || null;
}

/**
 * Retrieve all alerts with optional filtering
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export function getAlerts(filters?: AlertFilterOptions): SOSAlert[] {
  const data = getStoredData();
  let alerts = [...data.alerts];

  if (!filters) {
    // Return all alerts sorted by timestamp (newest first)
    return alerts.sort((a, b) => b.createdAt - a.createdAt);
  }

  // Filter by status
  if (filters.status) {
    const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
    alerts = alerts.filter(alert => statuses.includes(alert.status));
  }

  // Filter by urgency level
  if (filters.urgencyLevel) {
    const levels = Array.isArray(filters.urgencyLevel) ? filters.urgencyLevel : [filters.urgencyLevel];
    alerts = alerts.filter(alert => levels.includes(alert.urgencyLevel));
  }

  // Filter by alert type
  if (filters.alertType) {
    const types = Array.isArray(filters.alertType) ? filters.alertType : [filters.alertType];
    alerts = alerts.filter(alert => types.includes(alert.alertType));
  }

  // Filter by date range
  if (filters.startDate) {
    alerts = alerts.filter(alert => alert.createdAt >= filters.startDate!);
  }

  if (filters.endDate) {
    alerts = alerts.filter(alert => alert.createdAt <= filters.endDate!);
  }

  // Search by pilgrim name or location
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    alerts = alerts.filter(alert => {
      const name = alert.pilgrimInfo.name?.toLowerCase() || '';
      const address = alert.location.address?.toLowerCase() || '';
      const zone = alert.location.zone?.toLowerCase() || '';
      
      return name.includes(query) || address.includes(query) || zone.includes(query);
    });
  }

  // Sort by timestamp (newest first)
  return alerts.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Update an existing alert
 * Requirements: 6.1, 7.2
 */
export function updateAlert(alertId: string, updates: Partial<SOSAlert>): SOSAlert {
  const data = getStoredData();
  const alertIndex = data.alerts.findIndex(alert => alert.id === alertId);

  if (alertIndex === -1) {
    throw new StorageError(`Alert with ID ${alertId} not found`);
  }

  // Update the alert
  const updatedAlert: SOSAlert = {
    ...data.alerts[alertIndex],
    ...updates,
    id: alertId, // Ensure ID cannot be changed
    updatedAt: Date.now()
  };

  data.alerts[alertIndex] = updatedAlert;
  saveStoredData(data);

  return updatedAlert;
}

/**
 * Delete an alert by ID
 * Requirements: 7.2
 */
export function deleteAlert(alertId: string): boolean {
  const data = getStoredData();
  const initialLength = data.alerts.length;
  
  data.alerts = data.alerts.filter(alert => alert.id !== alertId);
  
  if (data.alerts.length === initialLength) {
    return false; // Alert not found
  }

  saveStoredData(data);
  return true;
}

/**
 * Delete all alerts (useful for testing or cleanup)
 */
export function clearAllAlerts(): void {
  const data: StoredSOSData = {
    version: STORAGE_VERSION,
    alerts: [],
    lastUpdated: Date.now()
  };
  
  saveStoredData(data);
}

/**
 * Get timestamp of last data update
 * Requirements: 5.1
 */
export function getLastUpdated(): number {
  const data = getStoredData();
  return data.lastUpdated;
}

/**
 * Get storage statistics
 */
export function getStorageStats(): {
  totalAlerts: number;
  pendingAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  lastUpdated: number;
} {
  const data = getStoredData();
  
  return {
    totalAlerts: data.alerts.length,
    pendingAlerts: data.alerts.filter(a => a.status === AlertStatus.PENDING).length,
    acknowledgedAlerts: data.alerts.filter(a => a.status === AlertStatus.ACKNOWLEDGED).length,
    resolvedAlerts: data.alerts.filter(a => a.status === AlertStatus.RESOLVED).length,
    lastUpdated: data.lastUpdated
  };
}

// ============================================================================
// User Profile Storage Utilities
// Requirements: 5.5
// ============================================================================

const PROFILE_STORAGE_KEY = 'sos_user_profile';

/**
 * User Profile Interface
 */
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  emergencyContact?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * User Profile Validation Result
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate user profile data
 * Requirements: 5.5
 */
function validateUserProfile(profile: Partial<UserProfile>): ValidationResult {
  const errors: string[] = [];

  // Validate name
  if (profile.name !== undefined) {
    if (typeof profile.name !== 'string' || profile.name.trim().length === 0) {
      errors.push('Name is required and must be a non-empty string');
    } else if (profile.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (profile.name.trim().length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  // Validate phone
  if (profile.phone !== undefined) {
    if (typeof profile.phone !== 'string' || profile.phone.trim().length === 0) {
      errors.push('Phone number is required and must be a non-empty string');
    } else {
      // Basic phone validation (10-15 digits, may include +, -, spaces, parentheses)
      const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
      if (!phoneRegex.test(profile.phone.trim())) {
        errors.push('Phone number must be 10-15 digits and may include +, -, spaces, or parentheses');
      }
    }
  }

  // Validate emergency contact (optional)
  if (profile.emergencyContact !== undefined && profile.emergencyContact.trim().length > 0) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
    if (!phoneRegex.test(profile.emergencyContact.trim())) {
      errors.push('Emergency contact must be a valid phone number (10-15 digits)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Save user profile to localStorage
 * Requirements: 5.5
 */
export function saveUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): UserProfile {
  if (!isLocalStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  // Validate profile data
  const validation = validateUserProfile(profile);
  if (!validation.valid) {
    throw new StorageError(`Invalid profile data: ${validation.errors.join(', ')}`);
  }

  try {
    const existingProfile = getUserProfile();
    const now = Date.now();

    const profileToSave: UserProfile = {
      ...profile,
      name: profile.name.trim(),
      phone: profile.phone.trim(),
      emergencyContact: profile.emergencyContact?.trim() || undefined,
      createdAt: existingProfile?.createdAt || now,
      updatedAt: now
    };

    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToSave));
    return profileToSave;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageQuotaError('Storage quota exceeded');
    }
    console.error('Error saving user profile:', error);
    throw new StorageError('Failed to save user profile');
  }
}

/**
 * Retrieve user profile from localStorage
 * Requirements: 5.5
 */
export function getUserProfile(): UserProfile | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const data = localStorage.getItem(PROFILE_STORAGE_KEY);
    
    if (!data) {
      return null;
    }

    const profile = JSON.parse(data) as UserProfile;
    
    // Validate retrieved profile structure
    if (!profile.id || !profile.name || !profile.phone) {
      console.warn('Invalid profile structure in storage');
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error reading user profile:', error);
    return null;
  }
}

/**
 * Update user profile (partial update)
 * Requirements: 5.5
 */
export function updateUserProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>): UserProfile {
  const existingProfile = getUserProfile();
  
  if (!existingProfile) {
    throw new StorageError('No existing profile found. Please create a profile first.');
  }

  // Validate updates
  const validation = validateUserProfile(updates);
  if (!validation.valid) {
    throw new StorageError(`Invalid profile updates: ${validation.errors.join(', ')}`);
  }

  const updatedProfile: UserProfile = {
    ...existingProfile,
    ...updates,
    id: existingProfile.id, // Ensure ID cannot be changed
    createdAt: existingProfile.createdAt, // Preserve creation time
    updatedAt: Date.now()
  };

  // Trim string fields
  if (updatedProfile.name) {
    updatedProfile.name = updatedProfile.name.trim();
  }
  if (updatedProfile.phone) {
    updatedProfile.phone = updatedProfile.phone.trim();
  }
  if (updatedProfile.emergencyContact) {
    updatedProfile.emergencyContact = updatedProfile.emergencyContact.trim();
  }

  return saveUserProfile(updatedProfile);
}

/**
 * Delete user profile
 */
export function deleteUserProfile(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return false;
  }
}

/**
 * Check if user profile exists
 * Requirements: 5.5
 */
export function hasUserProfile(): boolean {
  return getUserProfile() !== null;
}

/**
 * Get user profile or return default empty profile structure
 * Handles missing profile data gracefully
 * Requirements: 5.5
 */
export function getUserProfileOrDefault(): Partial<UserProfile> {
  const profile = getUserProfile();
  
  if (!profile) {
    return {
      name: undefined,
      phone: undefined,
      emergencyContact: undefined
    };
  }

  return profile;
}
