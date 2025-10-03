import { User } from 'firebase/auth'
import { DocumentData, QuerySnapshot, DocumentSnapshot } from 'firebase/firestore'

// Mock Firebase Auth User
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: 'test-refresh-token',
  tenantId: null,
  delete: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('test-id-token'),
  getIdTokenResult: jest.fn(),
  reload: jest.fn(),
  toJSON: jest.fn(),
  ...overrides,
} as User)

// Mock Firebase Auth
export const createMockAuth = () => ({
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    // Simulate immediate call with null user
    callback(null)
    // Return unsubscribe function
    return jest.fn()
  }),
  signInWithPopup: jest.fn().mockResolvedValue({
    user: createMockUser(),
    credential: null,
    operationType: 'signIn',
  }),
  signOut: jest.fn().mockResolvedValue(undefined),
  useEmulator: jest.fn(),
})

// Mock Google Auth Provider
export const createMockGoogleAuthProvider = () => ({
  providerId: 'google.com',
  setCustomParameters: jest.fn(),
})

// Mock Firestore Document Reference
export const createMockDocRef = (id = 'test-doc-id') => ({
  id,
  path: `test-collection/${id}`,
  parent: {
    id: 'test-collection',
    path: 'test-collection',
  },
  firestore: {},
  converter: null,
})

// Mock Firestore Document Snapshot
export const createMockDocSnapshot = (data: DocumentData = {}, exists = true): DocumentSnapshot => ({
  id: 'test-doc-id',
  ref: createMockDocRef(),
  exists: () => exists,
  data: () => exists ? data : undefined,
  get: (field: string) => exists ? data[field] : undefined,
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
  },
} as DocumentSnapshot)

// Mock Firestore Query Snapshot
export const createMockQuerySnapshot = (docs: DocumentData[] = []): QuerySnapshot => ({
  docs: docs.map((data, index) => createMockDocSnapshot(data, true)),
  empty: docs.length === 0,
  size: docs.length,
  forEach: jest.fn((callback) => {
    docs.forEach((data, index) => {
      callback(createMockDocSnapshot(data, true) as any)
    })
  }),
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
    isEqual: jest.fn(() => true),
  },
  query: {} as any,
  docChanges: jest.fn(() => []),
  toJSON: jest.fn(() => ({})),
} as QuerySnapshot)

// Mock Firestore Collection Reference
export const createMockCollectionRef = (id = 'test-collection') => ({
  id,
  path: id,
  parent: null,
  firestore: {},
  converter: null,
})

// Mock Firestore
export const createMockFirestore = () => ({
  collection: jest.fn().mockReturnValue(createMockCollectionRef()),
  doc: jest.fn().mockReturnValue(createMockDocRef()),
  addDoc: jest.fn().mockResolvedValue(createMockDocRef()),
  getDoc: jest.fn().mockResolvedValue(createMockDocSnapshot()),
  getDocs: jest.fn().mockResolvedValue(createMockQuerySnapshot()),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  deleteDoc: jest.fn().mockResolvedValue(undefined),
  onSnapshot: jest.fn((query, callback) => {
    // Simulate immediate callback with empty snapshot
    callback(createMockQuerySnapshot())
    // Return unsubscribe function
    return jest.fn()
  }),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  useEmulator: jest.fn(),
})

// Mock Firebase Error
export const createMockFirebaseError = (code = 'test/error', message = 'Test error') => ({
  code,
  message,
  name: 'FirebaseError',
  stack: 'Error stack trace',
})

// Mock Auth Service
export const createMockAuthService = () => ({
  signInWithGoogle: jest.fn().mockResolvedValue(createMockUser()),
  signOut: jest.fn().mockResolvedValue(undefined),
  getCurrentUser: jest.fn().mockReturnValue(null),
  onAuthStateChanged: jest.fn(),
})

// Mock Firestore Service
export const createMockFirestoreService = () => ({
  createDocument: jest.fn().mockResolvedValue('test-doc-id'),
  getDocument: jest.fn().mockResolvedValue({}),
  updateDocument: jest.fn().mockResolvedValue(undefined),
  deleteDocument: jest.fn().mockResolvedValue(undefined),
  subscribeToCollection: jest.fn().mockReturnValue(jest.fn()),
  subscribeToDocument: jest.fn().mockReturnValue(jest.fn()),
})

// Helper to create rejected promises for error testing
export const createRejectedPromise = (error: any) => Promise.reject(error)

// Helper to create resolved promises with delay
export const createDelayedPromise = <T>(value: T, delay = 100): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(value), delay))

// Mock Next.js Router
export const createMockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
})

// Mock Window Location
export const createMockLocation = () => ({
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
})