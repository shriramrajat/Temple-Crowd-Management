/**
 * Test configuration and setup utilities
 */

// Test environment configuration
export const TEST_CONFIG = {
  firebase: {
    projectId: 'test-project',
    apiKey: 'test-api-key',
    authDomain: 'test-project.firebaseapp.com',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abcdef123456',
  },
  emulator: {
    auth: {
      host: 'localhost',
      port: 9099,
    },
    firestore: {
      host: 'localhost',
      port: 8080,
    },
    ui: {
      host: 'localhost',
      port: 4000,
    },
  },
  timeouts: {
    default: 5000,
    async: 10000,
    emulator: 30000,
  },
}

// Test data constants
export const TEST_DATA = {
  users: {
    validUser: {
      uid: 'test-uid-1',
      email: 'test1@example.com',
      displayName: 'Test User 1',
      photoURL: 'https://example.com/photo1.jpg',
    },
    anotherUser: {
      uid: 'test-uid-2',
      email: 'test2@example.com',
      displayName: 'Test User 2',
      photoURL: 'https://example.com/photo2.jpg',
    },
  },
  documents: {
    testDoc: {
      id: 'test-doc-1',
      title: 'Test Document',
      content: 'This is a test document',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  },
  collections: {
    users: 'users',
    documents: 'documents',
    testCollection: 'test-collection',
  },
}

// Error messages for testing
export const TEST_ERRORS = {
  auth: {
    invalidCredentials: 'auth/invalid-credential',
    userNotFound: 'auth/user-not-found',
    networkError: 'auth/network-request-failed',
    tooManyRequests: 'auth/too-many-requests',
  },
  firestore: {
    permissionDenied: 'permission-denied',
    notFound: 'not-found',
    unavailable: 'unavailable',
    deadlineExceeded: 'deadline-exceeded',
  },
  general: {
    networkError: 'Network error',
    unknownError: 'Unknown error',
  },
}

// Test utilities configuration
export const TEST_UTILS_CONFIG = {
  // Default props for components
  defaultProps: {
    button: {
      type: 'button' as const,
      disabled: false,
    },
    card: {
      className: '',
    },
    loadingSpinner: {
      size: 'medium' as const,
    },
  },
  // Default context values
  defaultContextValues: {
    auth: {
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    },
    error: {
      error: null,
      showError: jest.fn(),
      clearError: jest.fn(),
      retryOperation: jest.fn(),
    },
  },
}

// Performance testing thresholds
export const PERFORMANCE_THRESHOLDS = {
  componentRender: 100, // ms
  apiCall: 1000, // ms
  pageLoad: 2000, // ms
}

// Accessibility testing configuration
export const A11Y_CONFIG = {
  rules: {
    // Disable specific rules for testing if needed
    'color-contrast': { enabled: false },
  },
  tags: ['wcag2a', 'wcag2aa'],
}

// Test environment detection
export const isTestEnvironment = () => process.env.NODE_ENV === 'test'
export const isEmulatorAvailable = () => 
  process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST

// Test setup helpers
export const setupTestEnvironment = () => {
  // Set test-specific environment variables
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = 'test'
  }
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = TEST_CONFIG.firebase.projectId
  
  // Mock console methods to reduce noise
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  jest.spyOn(console, 'error').mockImplementation(() => {})
}

export const cleanupTestEnvironment = () => {
  // Restore console methods
  jest.restoreAllMocks()
}