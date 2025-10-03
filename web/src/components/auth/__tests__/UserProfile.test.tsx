import React from 'react'
import { render, screen } from '@/test-utils'
import { UserProfile } from '../UserProfile'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('UserProfile Component', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders user profile when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<UserProfile />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('displays user photo when available', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<UserProfile />)
    
    const image = screen.getByAltText('Test User')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  it('shows default avatar when photo is not available', () => {
    const userWithoutPhoto = { ...mockUser, photoURL: null }
    mockUseAuth.mockReturnValue({
      user: userWithoutPhoto,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<UserProfile />)
    
    // Should show initials or default avatar
    expect(screen.getByText('TU')).toBeInTheDocument() // Initials
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<UserProfile />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('does not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    const { container } = render(<UserProfile />)
    expect(container.firstChild).toBeNull()
  })

  it('handles user without display name', () => {
    const userWithoutName = { ...mockUser, displayName: null }
    mockUseAuth.mockReturnValue({
      user: userWithoutName,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<UserProfile />)
    
    // Should show email as fallback
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})