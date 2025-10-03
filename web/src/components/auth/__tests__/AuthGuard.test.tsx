import React from 'react'
import { render, screen } from '@/test-utils'
import { AuthGuard } from '../AuthGuard'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

describe('AuthGuard Component', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    )
    
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    )
    
    expect(mockPush).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('redirects to custom redirect path when specified', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard redirectTo="/custom-login">
        <div>Protected content</div>
      </AuthGuard>
    )
    
    expect(mockPush).toHaveBeenCalledWith('/custom-login')
  })

  it('shows custom loading component when provided', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard loadingComponent={<div>Custom loading...</div>}>
        <div>Protected content</div>
      </AuthGuard>
    )
    
    expect(screen.getByText('Custom loading...')).toBeInTheDocument()
  })

  it('handles authentication errors gracefully', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Authentication error',
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(
      <AuthGuard>
        <div>Protected content</div>
      </AuthGuard>
    )
    
    // Should still redirect to login on error
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})