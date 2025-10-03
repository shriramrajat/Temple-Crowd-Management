import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { authService } from '@/services/auth/authService'

// Mock the auth service
jest.mock('@/services/auth/authService')
const mockAuthService = authService as jest.Mocked<typeof authService>

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, error, signIn, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? user.displayName : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={signIn} data-testid="sign-in">Sign In</button>
      <button onClick={signOut} data-testid="sign-out">Sign Out</button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockAuthService.getCurrentUser.mockReturnValue(null)
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      // Simulate initial auth state check
      setTimeout(() => callback(null), 0)
      return jest.fn() // unsubscribe function
    })
  })

  it('provides initial auth state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('No user')
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
    expect(screen.getByTestId('error')).toHaveTextContent('No error')

    // Wait for initial auth check to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  it('updates state when user signs in', async () => {
    mockAuthService.onAuthStateChanged.mockImplementation((callback) => {
      // Simulate user signing in
      setTimeout(() => callback(mockUser as any), 0)
      return jest.fn()
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading')
    })
  })

  it('handles sign in action', async () => {
    mockAuthService.signInWithGoogle.mockResolvedValue(mockUser as any)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByTestId('sign-in')
    
    await act(async () => {
      signInButton.click()
    })

    expect(mockAuthService.signInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('handles sign out action', async () => {
    mockAuthService.signOut.mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signOutButton = screen.getByTestId('sign-out')
    
    await act(async () => {
      signOutButton.click()
    })

    expect(mockAuthService.signOut).toHaveBeenCalledTimes(1)
  })

  it('handles authentication errors', async () => {
    const error = new Error('Authentication failed')
    mockAuthService.signInWithGoogle.mockRejectedValue(error)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByTestId('sign-in')
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Authentication failed')
    })
  })

  it('clears error on successful authentication', async () => {
    // First, set up an error state
    const error = new Error('Previous error')
    mockAuthService.signInWithGoogle.mockRejectedValueOnce(error)
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const signInButton = screen.getByTestId('sign-in')
    
    // Trigger error
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Previous error')
    })

    // Now succeed
    mockAuthService.signInWithGoogle.mockResolvedValue(mockUser as any)
    
    await act(async () => {
      signInButton.click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No error')
    })
  })

  it('sets up auth state listener on mount', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(mockAuthService.onAuthStateChanged).toHaveBeenCalledTimes(1)
    expect(mockAuthService.onAuthStateChanged).toHaveBeenCalledWith(expect.any(Function))
  })

  it('cleans up auth state listener on unmount', () => {
    const unsubscribe = jest.fn()
    mockAuthService.onAuthStateChanged.mockReturnValue(unsubscribe)

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})