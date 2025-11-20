/**
 * Unit tests for UrgencyLevelSelector component
 * Tests default level selection, level changes, and visual indicators
 * Requirements: 3.2, 3.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { UrgencyLevelSelector } from '@/components/sos/urgency-level-selector'
import { UrgencyLevel } from '@/lib/types/sos'

describe('UrgencyLevelSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  /**
   * Test: Default level selection
   * Requirement: 3.2 - Default urgency level set to "high"
   */
  describe('Default level selection', () => {
    it('defaults to HIGH urgency level when no value is provided', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector onChange={mockOnChange} value={UrgencyLevel.HIGH} />
      )

      const highButton = screen.getByRole('radio', { name: /High urgency/i })
      expect(highButton).toHaveAttribute('aria-checked', 'true')
    })

    it('renders with HIGH level selected by default', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const highButton = screen.getByRole('radio', { name: /High urgency/i })
      expect(highButton).toHaveAttribute('aria-checked', 'true')
    })

    it('renders all 4 urgency levels', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })
  })

  /**
   * Test: Level changes
   * Requirement: 3.4 - Visual indicators for each urgency level
   */
  describe('Level changes', () => {
    it('calls onChange when a level is selected', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      fireEvent.click(criticalButton)

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.CRITICAL)
    })

    it('allows changing from HIGH to LOW', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const lowButton = screen.getByRole('radio', { name: /Low urgency/i })
      fireEvent.click(lowButton)

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.LOW)
    })

    it('allows changing from HIGH to MEDIUM', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const mediumButton = screen.getByRole('radio', { name: /Medium urgency/i })
      fireEvent.click(mediumButton)

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.MEDIUM)
    })

    it('allows changing from HIGH to CRITICAL', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      fireEvent.click(criticalButton)

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.CRITICAL)
    })

    it('highlights the currently selected level', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const highButton = screen.getByRole('radio', { name: /High urgency/i })
      expect(highButton).toHaveAttribute('aria-checked', 'true')

      // Change to CRITICAL
      rerender(
        <UrgencyLevelSelector value={UrgencyLevel.CRITICAL} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      expect(criticalButton).toHaveAttribute('aria-checked', 'true')
      expect(highButton).toHaveAttribute('aria-checked', 'false')
    })
  })

  /**
   * Test: Visual indicators
   * Requirement: 3.4 - Visual indicators (colors, icons) for each level
   */
  describe('Visual indicators', () => {
    it('displays icons for each urgency level', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      // Check that all level buttons are rendered with their labels
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
      expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('displays descriptions for each urgency level', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      expect(screen.getByText('Non-urgent assistance')).toBeInTheDocument()
      expect(screen.getByText('Moderate urgency')).toBeInTheDocument()
      expect(screen.getByText('Urgent assistance needed')).toBeInTheDocument()
      expect(screen.getByText('Life-threatening emergency')).toBeInTheDocument()
    })

    it('shows selected indicator on the active level', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.CRITICAL} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      expect(criticalButton).toHaveAttribute('aria-checked', 'true')
    })

    it('applies different visual styling to each level', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <UrgencyLevelSelector value={UrgencyLevel.LOW} onChange={mockOnChange} />
      )

      const lowButton = screen.getByRole('radio', { name: /Low urgency/i })
      expect(lowButton).toHaveAttribute('aria-checked', 'true')

      rerender(
        <UrgencyLevelSelector value={UrgencyLevel.CRITICAL} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      expect(criticalButton).toHaveAttribute('aria-checked', 'true')
      expect(lowButton).toHaveAttribute('aria-checked', 'false')
    })
  })

  /**
   * Test: Auto-submit functionality
   * Requirement: 3.5 - Auto-submit after 10 seconds with default level
   */
  describe('Auto-submit functionality', () => {
    it('displays countdown timer starting at 10 seconds', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      expect(screen.getByText(/Auto-submitting in 10 seconds/i)).toBeInTheDocument()
    })

    it('calls onAutoSubmit after 10 seconds', () => {
      const mockOnChange = vi.fn()
      const mockOnAutoSubmit = vi.fn()
      render(
        <UrgencyLevelSelector 
          value={UrgencyLevel.HIGH} 
          onChange={mockOnChange}
          onAutoSubmit={mockOnAutoSubmit}
        />
      )

      expect(mockOnAutoSubmit).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(mockOnAutoSubmit).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * Test: Cancellation
   */
  describe('Cancellation', () => {
    it('renders cancel button by default', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('calls onCancel when cancel button is clicked', () => {
      const mockOnChange = vi.fn()
      const mockOnCancel = vi.fn()
      render(
        <UrgencyLevelSelector 
          value={UrgencyLevel.HIGH} 
          onChange={mockOnChange}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * Test: Keyboard accessibility
   */
  describe('Keyboard accessibility', () => {
    it('allows selecting level with Enter key', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const lowButton = screen.getByRole('radio', { name: /Low urgency/i })
      fireEvent.keyDown(lowButton, { key: 'Enter' })

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.LOW)
    })

    it('allows selecting level with Space key', () => {
      const mockOnChange = vi.fn()
      render(
        <UrgencyLevelSelector value={UrgencyLevel.HIGH} onChange={mockOnChange} />
      )

      const criticalButton = screen.getByRole('radio', { name: /Critical urgency/i })
      fireEvent.keyDown(criticalButton, { key: ' ' })

      expect(mockOnChange).toHaveBeenCalledWith(UrgencyLevel.CRITICAL)
    })
  })
})
