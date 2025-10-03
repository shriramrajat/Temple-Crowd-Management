import { 
  createMockUser, 
  createMockAuth, 
  createMockFirestore,
  setupFirebaseEmulator,
  teardownFirebaseEmulator,
  TEST_CONFIG 
} from '@/test-utils'

describe('Test Setup', () => {
  it('should run tests', () => {
    expect(true).toBe(true)
  })

  it('should have environment variables mocked', () => {
    expect(process.env.NEXT_PUBLIC_FIREBASE_API_KEY).toBe('test-api-key')
    expect(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe('test-project')
  })

  it('should have Firebase emulator environment variables set', () => {
    expect(process.env.FIRESTORE_EMULATOR_HOST).toBe('localhost:8080')
    expect(process.env.FIREBASE_AUTH_EMULATOR_HOST).toBe('localhost:9099')
  })

  it('should create mock Firebase Auth', () => {
    const mockAuth = createMockAuth()
    expect(mockAuth).toHaveProperty('currentUser')
    expect(mockAuth).toHaveProperty('onAuthStateChanged')
    expect(mockAuth).toHaveProperty('signInWithPopup')
    expect(mockAuth).toHaveProperty('signOut')
  })

  it('should create mock Firestore', () => {
    const mockFirestore = createMockFirestore()
    expect(mockFirestore).toHaveProperty('collection')
    expect(mockFirestore).toHaveProperty('doc')
    expect(mockFirestore).toHaveProperty('addDoc')
    expect(mockFirestore).toHaveProperty('getDoc')
  })

  it('should create mock user', () => {
    const mockUser = createMockUser()
    expect(mockUser).toHaveProperty('uid')
    expect(mockUser).toHaveProperty('email')
    expect(mockUser).toHaveProperty('displayName')
    expect(mockUser.uid).toBe('test-uid')
  })

  it('should setup and teardown Firebase emulator environment', () => {
    setupFirebaseEmulator()
    expect(process.env.FIRESTORE_EMULATOR_HOST).toBe('localhost:8080')
    expect(process.env.FIREBASE_AUTH_EMULATOR_HOST).toBe('localhost:9099')
    
    teardownFirebaseEmulator()
    // Note: In Jest setup, these are set globally, so they won't be deleted
    // This test is more for documentation of the API
  })

  it('should have test configuration available', () => {
    expect(TEST_CONFIG).toHaveProperty('firebase')
    expect(TEST_CONFIG).toHaveProperty('emulator')
    expect(TEST_CONFIG).toHaveProperty('timeouts')
    expect(TEST_CONFIG.firebase.projectId).toBe('test-project')
  })
})