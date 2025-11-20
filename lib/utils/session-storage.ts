/**
 * Session Storage Utility
 * 
 * Handles temporary data storage for accessibility features
 * Data persists only for the current browser session
 */

/**
 * Session storage keys
 */
export const SESSION_KEYS = {
  ROUTE_CALCULATION: 'temp_route_calculation',
  SLOT_SELECTION: 'temp_slot_selection',
  FORM_DRAFT: 'temp_form_draft',
  NAVIGATION_STATE: 'temp_navigation_state',
  LAST_ROUTE_OPTIONS: 'temp_last_route_options',
} as const;

/**
 * Save data to session storage
 */
export function saveToSession<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined') return false;

  try {
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to session storage:', error);
    return false;
  }
}

/**
 * Get data from session storage
 */
export function getFromSession<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from session storage:', error);
    return null;
  }
}

/**
 * Remove data from session storage
 */
export function removeFromSession(key: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from session storage:', error);
    return false;
  }
}

/**
 * Clear all session storage
 */
export function clearSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing session storage:', error);
    return false;
  }
}

/**
 * Check if session storage is available
 */
export function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const test = '__session_storage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Save form draft to session storage
 */
export function saveFormDraft(formId: string, data: any): boolean {
  return saveToSession(`${SESSION_KEYS.FORM_DRAFT}_${formId}`, {
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get form draft from session storage
 */
export function getFormDraft<T>(formId: string): T | null {
  const draft = getFromSession<{ data: T; timestamp: string }>(
    `${SESSION_KEYS.FORM_DRAFT}_${formId}`
  );
  return draft ? draft.data : null;
}

/**
 * Clear form draft
 */
export function clearFormDraft(formId: string): boolean {
  return removeFromSession(`${SESSION_KEYS.FORM_DRAFT}_${formId}`);
}

/**
 * Save last route calculation options
 */
export function saveLastRouteOptions(options: any): boolean {
  return saveToSession(SESSION_KEYS.LAST_ROUTE_OPTIONS, options);
}

/**
 * Get last route calculation options
 */
export function getLastRouteOptions<T>(): T | null {
  return getFromSession<T>(SESSION_KEYS.LAST_ROUTE_OPTIONS);
}
