import { initializeApp, getApps, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'

// Firebase emulator configuration
const EMULATOR_CONFIG = {
  auth: {
    host: 'localhost',
    port: 9099,
  },
  firestore: {
    host: 'localhost',
    port: 8080,
  },
}

// Test Firebase app configuration
const TEST_FIREBASE_CONFIG = {
  apiKey: 'test-api-key',
  authDomain: 'test-project.firebaseapp.com',
  projectId: 'test-project',
  storageBucket: 'test-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
}

let testApp: any = null
let testAuth: Auth | null = null
let testFirestore: Firestore | null = null

/**
 * Initialize Firebase app with emulator for testing
 */
export const initializeTestFirebase = () => {
  try {
    // Clean up existing apps
    const existingApps = getApps()
    existingApps.forEach(app => deleteApp(app))

    // Initialize test app
    testApp = initializeApp(TEST_FIREBASE_CONFIG, 'test-app')
    
    // Initialize Auth with emulator
    testAuth = getAuth(testApp)
    try {
      connectAuthEmulator(testAuth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
        disableWarnings: true,
      })
    } catch (error) {
      // Emulator already connected, ignore error
    }
    
    // Initialize Firestore with emulator
    testFirestore = getFirestore(testApp)
    try {
      connectFirestoreEmulator(testFirestore, EMULATOR_CONFIG.firestore.host, EMULATOR_CONFIG.firestore.port)
    } catch (error) {
      // Emulator already connected, ignore error
    }
    
    return {
      app: testApp,
      auth: testAuth,
      firestore: testFirestore,
    }
  } catch (error) {
    console.warn('Firebase emulator initialization failed:', error)
    return null
  }
}

/**
 * Clean up Firebase test instances
 */
export const cleanupTestFirebase = async () => {
  try {
    if (testApp) {
      await deleteApp(testApp)
      testApp = null
      testAuth = null
      testFirestore = null
    }
  } catch (error) {
    console.warn('Firebase cleanup failed:', error)
  }
}

/**
 * Get test Firebase instances
 */
export const getTestFirebase = () => ({
  app: testApp,
  auth: testAuth,
  firestore: testFirestore,
})

/**
 * Check if Firebase emulator is running
 */
export const isEmulatorRunning = async (): Promise<boolean> => {
  try {
    const response = await fetch(`http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Wait for emulator to be ready
 */
export const waitForEmulator = async (timeout = 5000): Promise<boolean> => {
  const start = Date.now()
  
  while (Date.now() - start < timeout) {
    if (await isEmulatorRunning()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return false
}

/**
 * Clear all emulator data
 */
export const clearEmulatorData = async () => {
  try {
    // Clear Auth emulator
    await fetch(`http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/emulator/v1/projects/test-project/accounts`, {
      method: 'DELETE',
    })
    
    // Clear Firestore emulator
    await fetch(`http://${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}/emulator/v1/projects/test-project/databases/(default)/documents`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.warn('Failed to clear emulator data:', error)
  }
}

/**
 * Setup emulator environment variables
 */
export const setupEmulatorEnv = () => {
  process.env.FIRESTORE_EMULATOR_HOST = `${EMULATOR_CONFIG.firestore.host}:${EMULATOR_CONFIG.firestore.port}`
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`
}

/**
 * Cleanup emulator environment variables
 */
export const cleanupEmulatorEnv = () => {
  delete process.env.FIRESTORE_EMULATOR_HOST
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST
}