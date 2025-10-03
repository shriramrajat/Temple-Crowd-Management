import React from 'react'
import { render, screen } from '@/test-utils'
import { Header } from '../Header'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Header Component', () => {
  const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders header with app title', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText(/my app/i)).toBeInTheDocument()
  })

  it('shows login button when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Header />)
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows user profile and sign out button when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('shows loading state in header', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('applies responsive styling', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    const { container } = render(<Header />)
    const header = container.firstChild as HTMLElement
    
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b')
  })

  it('contains navigation elements', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signOut: jest.fn(),
    })

    render(<Header />)
    
    // Check for navigation structure
    const nav = screen.getByRole('banner') || screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})