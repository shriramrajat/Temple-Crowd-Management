import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { SignOutButton } from '../SignOutButton'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('SignOutButton Component', () => {
  const mockSignOut = jest.fn()
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: mockSignOut,
    })
  })

  it('renders sign out button when user is authenticated', () => {
    render(<SignOutButton />)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toBeInTheDocument()
  })

  it('calls signOut when clicked', async () => {
    render(<SignOutButton />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('shows loading state during sign out', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: true,
      error: null,
      signIn: jest.fn(),
      signOut: mockSignOut,
    })

    render(<SignOutButton />)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(screen.getByText(/signing out/i)).toBeInTheDocument()
  })

  it('does not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: mockSignOut,
    })

    const { container } = render(<SignOutButton />)
    expect(container.firstChild).toBeNull()
  })

  it('handles sign out errors gracefully', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'))
    
    render(<SignOutButton />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1)
    })
  })

  it('accepts custom variant styling', () => {
    render(<SignOutButton variant="outline" />)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('border-gray-300')
  })

  it('accepts custom size styling', () => {
    render(<SignOutButton size="sm" />)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
  })
})