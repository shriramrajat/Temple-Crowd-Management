import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AccessibilityProfileForm } from '@/components/accessibility/profile-form'
import { AccessibilityBadges, AccessibilityBadge } from '@/components/accessibility/badges'
import { 
  saveProfile, 
  getProfile, 
  updateProfile,
  deleteProfile 
} from '@/lib/services/accessibility-service'
import type { AccessibilityProfile } from '@/lib/types/accessibility'

describe('Accessibility Profile Management', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('AccessibilityBadge Component', () => {
    it('renders elderly badge with correct styling', () => {
      render(<AccessibilityBadge category="elderly" />)
      expect(screen.getByText('Elderly')).toBeInTheDocument()
    })

    it('renders differently-abled badge', () => {
      render(<AccessibilityBadge category="differently-abled" />)
      expect(screen.getByText('Differently-Abled')).toBeInTheDocument()
    })

    it('renders wheelchair user badge', () => {
      render(<AccessibilityBadge category="wheelchair-user" />)
      expect(screen.getByText('Wheelchair User')).toBeInTheDocument()
    })

    it('renders women-only route badge', () => {
      render(<AccessibilityBadge category="women-only-route" />)
      expect(screen.getByText('Women-Only Route')).toBeInTheDocument()
    })
  })

  describe('AccessibilityBadges Component', () => {
    it('renders multiple badges', () => {
      render(<AccessibilityBadges categories={['elderly', 'wheelchair-user']} />)
      expect(screen.getByText('Elderly')).toBeInTheDocument()
      expect(screen.getByText('Wheelchair User')).toBeInTheDocument()
    })

    it('renders nothing when categories array is empty', () => {
      const { container } = render(<AccessibilityBadges categories={[]} />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Accessibility Service', () => {
    const mockProfile: AccessibilityProfile = {
      pilgrimId: 'test-pilgrim-001',
      categories: ['elderly', 'wheelchair-user'],
      mobilitySpeed: 'slow',
      requiresAssistance: true,
      emergencyContact: {
        name: 'John Doe',
        phone: '+91 98765 43210',
        relationship: 'Son',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('saves profile to localStorage', async () => {
      const saved = await saveProfile(mockProfile)
      expect(saved.pilgrimId).toBe(mockProfile.pilgrimId)
      expect(saved.categories).toEqual(mockProfile.categories)
    })

    it('retrieves profile from localStorage', async () => {
      await saveProfile(mockProfile)
      const retrieved = await getProfile('test-pilgrim-001')
      expect(retrieved).not.toBeNull()
      expect(retrieved?.pilgrimId).toBe('test-pilgrim-001')
      expect(retrieved?.categories).toEqual(['elderly', 'wheelchair-user'])
    })

    it('updates existing profile', async () => {
      await saveProfile(mockProfile)
      const updated = await updateProfile('test-pilgrim-001', {
        mobilitySpeed: 'moderate',
        requiresAssistance: false,
      })
      expect(updated.mobilitySpeed).toBe('moderate')
      expect(updated.requiresAssistance).toBe(false)
    })

    it('deletes profile from localStorage', async () => {
      await saveProfile(mockProfile)
      const deleted = await deleteProfile('test-pilgrim-001')
      expect(deleted).toBe(true)
      const retrieved = await getProfile('test-pilgrim-001')
      expect(retrieved).toBeNull()
    })

    it('returns null for non-existent profile', async () => {
      const retrieved = await getProfile('non-existent-id')
      expect(retrieved).toBeNull()
    })
  })

  describe('AccessibilityProfileForm Component', () => {
    it('renders form with all sections', () => {
      const mockSubmit = () => {}
      render(<AccessibilityProfileForm onSubmit={mockSubmit} />)
      
      expect(screen.getByText('Accessibility Categories')).toBeInTheDocument()
      expect(screen.getByText('Mobility Speed')).toBeInTheDocument()
      expect(screen.getByText('Requires Assistance')).toBeInTheDocument()
      expect(screen.getByText('Emergency Contact (Optional)')).toBeInTheDocument()
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument()
    })

    it('displays all accessibility category options', () => {
      const mockSubmit = () => {}
      render(<AccessibilityProfileForm onSubmit={mockSubmit} />)
      
      expect(screen.getByText('Elderly')).toBeInTheDocument()
      expect(screen.getByText('Differently-Abled')).toBeInTheDocument()
      expect(screen.getByText('Wheelchair User')).toBeInTheDocument()
      expect(screen.getByText('Women-Only Route Preference')).toBeInTheDocument()
    })
  })
})
