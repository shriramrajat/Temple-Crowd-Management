import { authService } from '../authService'
import { 
  getAuth, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider 
} from 'firebase/auth'

// Mock Firebase auth functions
jest.mock('firebase/auth')
const mockGetAuth = getAuth as jest.MockedFunction<typeof getAuth>
const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockSignOut = firebaseSignOut as jest.MockedFunction<typeof firebaseSignOut>
const mockOnAuthStateChanged = onAuthStateChanged as jest.MockedFunction<typeof onAuthStateChanged>
const mockGoogleAuthProvider = GoogleAuthProvider as jest.MockedFunction<typeof GoogleAuthProvider>

describe('AuthService', () => {
  const mockAuth = {
    currentUser: null,
  }

  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAuth.mockReturnValue(mockAuth as any)
    mockGoogleAuthProvider.mockImplementation(() => ({} as any))
  })

  describe('signInWithGoogle', () => {
    it('successfully signs in with Google', async () => {
      const mockUserCredential = {
        user: mockUser,
      }
      mockSignInWithPopup.mockResolvedValue(mockUserCredential as any)

      const result = await authService.signInWithGoogle()

      expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(Object))
      expect(result).toEqual(mockUser)
    })

    it('handles sign in errors', async () => {
      const error = new Error('Sign in failed')
      mockSignInWithPopup.mockRejectedValue(error)

      await expect(authService.signInWithGoogle()).rejects.toThrow('Sign in failed')
    })

    it('handles popup closed by user', async () => {
      const error = { code: 'auth/popup-closed-by-user' }
      mockSignInWithPopup.mockRejectedValue(error)

      await expect(authService.signInWithGoogle()).rejects.toMatchObject({
        code: 'auth/popup-closed-by-user'
      })
    })

    it('handles network errors', async () => {
      const error = { code: 'auth/network-request-failed' }
      mockSignInWithPopup.mockRejectedValue(error)

      await expect(authService.signInWithGoogle()).rejects.toMatchObject({
        code: 'auth/network-request-failed'
      })
    })
  })

  describe('signOut', () => {
    it('successfully signs out', async () => {
      mockSignOut.mockResolvedValue(undefined)

      await authService.signOut()

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth)
    })

    it('handles sign out errors', async () => {
      const error = new Error('Sign out failed')
      mockSignOut.mockRejectedValue(error)

      await expect(authService.signOut()).rejects.toThrow('Sign out failed')
    })
  })

  describe('getCurrentUser', () => {
    it('returns current user when authenticated', () => {
      mockAuth.currentUser = mockUser as any

      const result = authService.getCurrentUser()

      expect(result).toEqual(mockUser)
    })

    it('returns null when not authenticated', () => {
      mockAuth.currentUser = null

      const result = authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChanged', () => {
    it('sets up auth state listener', () => {
      const callback = jest.fn()
      const unsubscribe = jest.fn()
      mockOnAuthStateChanged.mockReturnValue(unsubscribe)

      const result = authService.onAuthStateChanged(callback)

      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuth, callback)
      expect(result).toBe(unsubscribe)
    })

    it('calls callback with user when authenticated', () => {
      const callback = jest.fn()
      mockOnAuthStateChanged.mockImplementation((auth, cb) => {
        cb(mockUser as any)
        return jest.fn()
      })

      authService.onAuthStateChanged(callback)

      expect(callback).toHaveBeenCalledWith(mockUser)
    })

    it('calls callback with null when not authenticated', () => {
      const callback = jest.fn()
      mockOnAuthStateChanged.mockImplementation((auth, cb) => {
        cb(null)
        return jest.fn()
      })

      authService.onAuthStateChanged(callback)

      expect(callback).toHaveBeenCalledWith(null)
    })
  })
})