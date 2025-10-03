import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { LoginButton } from '../LoginButton'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginButton Component', () => {
  const mockSignIn = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
    })
  })

  it('renders login button correctly', () => {
    render(<LoginButton />)
    const button = screen.getByRole('button', { name: /sign in with google/i })
    expect(button).toBeInTheDocument()
  })

  it('calls signIn when clicked', async () => {
    render(<LoginButton />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(mockSignIn).toHaveBeenCalledTimes(1)
  })

  it('shows loading state during authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
    })

    render(<LoginButton />)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })

  it('displays error message when authentication fails', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: 'Authentication failed',
      signIn: mockSignIn,
      signOut: jest.fn(),
    })

    render(<LoginButton />)
    
    expect(screen.getByText('Authentication failed')).toBeInTheDocument()
  })

  it('does not render when user is already authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      },
      loading: false,
      error: null,
      signIn: mockSignIn,
      signOut: jest.fn(),
    })

    const { container } = render(<LoginButton />)
    expect(container.firstChild).toBeNull()
  })

  it('handles sign in errors gracefully', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))
    
    render(<LoginButton />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1)
    })
  })
})