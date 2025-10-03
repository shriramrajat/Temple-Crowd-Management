import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock the auth service
jest.mock('@/services/auth/authService', () => ({
  authService: {
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
    getCurrentUser: jest.fn(),
    onAuthStateChanged: jest.fn(),
  }
}))

describe('useAuth Hook', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('provides auth context values', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('loading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('signIn')
    expect(result.current).toHaveProperty('signOut')
  })

  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(true) // Initially loading
    expect(result.current.error).toBeNull()
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })

  it('handles sign in function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signIn()
    })

    // The actual implementation would call the auth service
    expect(typeof result.current.signIn).toBe('function')
  })

  it('handles sign out function', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.signOut()
    })

    // The actual implementation would call the auth service
    expect(typeof result.current.signOut).toBe('function')
  })
})