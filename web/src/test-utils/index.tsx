import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorProvider } from '@/components/providers/ErrorProvider'

// Mock user for testing
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
}

// Mock auth context value
export const mockAuthContextValue = {
  user: null,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Helper function to create mock Firebase functions
export const createMockFirebaseAuth = () => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
})

export const createMockFirestore = () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  onSnapshot: jest.fn(),
})

// Firebase Emulator utilities
export const setupFirebaseEmulator = () => {
  // Set emulator environment variables
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
  
  // Mock Firebase config to use emulator
  jest.doMock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({
      name: 'test-app',
      options: {
        projectId: 'test-project',
      },
    })),
  }))
}

export const teardownFirebaseEmulator = () => {
  delete process.env.FIRESTORE_EMULATOR_HOST
  delete process.env.FIREBASE_AUTH_EMULATOR_HOST
}

// Mock Firebase Auth with emulator support
export const createMockAuthWithEmulator = () => {
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: jest.fn(),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    useEmulator: jest.fn(),
  }
  
  return mockAuth
}

// Mock Firestore with emulator support
export const createMockFirestoreWithEmulator = () => {
  const mockFirestore = {
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    getDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    useEmulator: jest.fn(),
  }
  
  return mockFirestore
}

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to create test data
export const createTestUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
})

// Helper to create mock error
export const createMockError = (message = 'Test error', code = 'test/error') => ({
  message,
  code,
  name: 'FirebaseError',
})

// Helper for testing async Firebase operations
export function mockFirebaseOperation<T>(
  result: T,
  shouldReject = false,
  delay = 0
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldReject) {
        reject(createMockError('Operation failed'))
      } else {
        resolve(result)
      }
    }, delay)
  })
}

// Helper to mock Firebase Auth state changes
export const mockAuthStateChange = (user: any = null) => {
  const callback = jest.fn()
  const unsubscribe = jest.fn()
  
  // Simulate auth state change
  setTimeout(() => {
    callback(user)
  }, 0)
  
  return { callback, unsubscribe }
}

// Re-export all test utilities
export * from './firebase-mocks'
export * from './firebase-emulator'
export * from './test-config'
export * from './integration-helpers'