/**
 * Integration test helpers for Firebase emulator testing
 */

import { initializeTestFirebase, cleanupTestFirebase, clearEmulatorData } from './firebase-emulator'
import { TEST_CONFIG, TEST_DATA } from './test-config'

// Integration test setup
export const setupIntegrationTest = async () => {
  // Initialize Firebase with emulator
  const firebase = initializeTestFirebase()
  
  if (!firebase) {
    throw new Error('Failed to initialize Firebase for integration testing')
  }
  
  // Clear any existing data
  await clearEmulatorData()
  
  return firebase
}

// Integration test cleanup
export const cleanupIntegrationTest = async () => {
  await clearEmulatorData()
  await cleanupTestFirebase()
}

// Helper to create test user in emulator
export const createTestUserInEmulator = async (auth: any, userData = TEST_DATA.users.validUser) => {
  try {
    // This would typically use Firebase Admin SDK in a real integration test
    // For now, we'll simulate the user creation
    const mockUser = {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
    }
    
    return mockUser
  } catch (error) {
    console.error('Failed to create test user:', error)
    throw error
  }
}

// Helper to create test documents in Firestore emulator
export const createTestDocumentInEmulator = async (
  firestore: any,
  collection: string,
  docId: string,
  data: any
) => {
  try {
    // This would use actual Firestore operations in a real integration test
    const docRef = {
      id: docId,
      path: `${collection}/${docId}`,
      data: () => data,
    }
    
    return docRef
  } catch (error) {
    console.error('Failed to create test document:', error)
    throw error
  }
}

// Helper to wait for async operations in integration tests
export const waitForIntegrationAsync = (timeout = TEST_CONFIG.timeouts.async) => {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

// Helper to simulate network delays in integration tests
export const simulateNetworkDelay = (min = 100, max = 500) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Helper to test error scenarios
export const simulateFirebaseError = (errorCode: string, errorMessage: string) => {
  const error = new Error(errorMessage)
  ;(error as any).code = errorCode
  return error
}

// Helper for testing authentication flows
export const testAuthFlow = async (auth: any, operation: () => Promise<any>) => {
  const initialUser = auth.currentUser
  
  try {
    const result = await operation()
    return {
      success: true,
      result,
      initialUser,
      finalUser: auth.currentUser,
    }
  } catch (error) {
    return {
      success: false,
      error,
      initialUser,
      finalUser: auth.currentUser,
    }
  }
}

// Helper for testing Firestore operations
export const testFirestoreOperation = async (
  firestore: any,
  operation: () => Promise<any>
) => {
  try {
    const result = await operation()
    return {
      success: true,
      result,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

// Helper to verify component behavior with real Firebase
export const testComponentWithFirebase = async (
  component: React.ComponentType,
  firebase: any,
  testScenario: () => Promise<void>
) => {
  try {
    await testScenario()
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

// Performance testing helper
export const measurePerformance = async (operation: () => Promise<any>) => {
  const start = performance.now()
  const result = await operation()
  const end = performance.now()
  
  return {
    result,
    duration: end - start,
  }
}

// Helper to test real-time subscriptions
export const testRealtimeSubscription = (
  subscriptionFn: (callback: (data: any) => void) => () => void,
  expectedUpdates: any[],
  timeout = TEST_CONFIG.timeouts.async
) => {
  return new Promise((resolve, reject) => {
    const receivedUpdates: any[] = []
    let updateCount = 0
    
    const unsubscribe = subscriptionFn((data) => {
      receivedUpdates.push(data)
      updateCount++
      
      if (updateCount >= expectedUpdates.length) {
        unsubscribe()
        resolve(receivedUpdates)
      }
    })
    
    // Timeout if we don't receive expected updates
    setTimeout(() => {
      unsubscribe()
      reject(new Error(`Timeout: Expected ${expectedUpdates.length} updates, received ${updateCount}`))
    }, timeout)
  })
}