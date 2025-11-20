/**
 * Unit tests for AlertTypeSelector component
 * Tests alert type selection, auto-submit timeout, and cancellation
 * Requirements: 2.1, 2.4, 2.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AlertTypeSelector } from '@/components/sos/alert-type-selector'
import { AlertType } from '@/lib/types/sos'

describe('AlertTypeSelector', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  /**
   * Test: Alert type selection
   * Requirement: 2.1 - Pilgrim can select alert type
   */
  describe('Alert type selection', () => {
    it('renders all 5 alert types', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      expect(screen.getByText('Medical Emergency')).toBeInTheDocument()
      expect(screen.getByText('Security Threat')).toBeInTheDocument()
      expect(screen.getByText('Lost Person')).toBeInTheDocument()
      expect(screen.getByText('Accident')).toBeInTheDocument()
      expect(screen.getByText('General Assistance')).toBeInTheDocument()
    })

    it('calls onChange when an alert type is selected', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      const medicalButton = screen.getByRole('radio', { name: /Medical Emergency/i })
      fireEvent.click(medicalButton)

      expect(mockOnChange).toHaveBeenCalledWith(AlertType.MEDICAL)
    })

    it('highlights the selected alert type', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={AlertType.SECURITY} onChange={mockOnChange} />
      )

      const securityButton = screen.getByRole('radio', { name: /Security Threat/i })
      expect(securityButton).toHaveAttribute('aria-checked', 'true')
    })

    it('allows selecting different alert types', () => {
      const mockOnChange = vi.fn()
      const { rerender } = render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      // Select medical
      const medicalButton = screen.getByRole('radio', { name: /Medical Emergency/i })
      fireEvent.click(medicalButton)
      expect(mockOnChange).toHaveBeenCalledWith(AlertType.MEDICAL)

      // Rerender with medical selected
      rerender(
        <AlertTypeSelector value={AlertType.MEDICAL} onChange={mockOnChange} />
      )

      // Select lost
      const lostButton = screen.getByRole('radio', { name: /Lost Person/i })
      fireEvent.click(lostButton)
      expect(mockOnChange).toHaveBeenCalledWith(AlertType.LOST)
    })
  })

  /**
   * Test: Auto-submit timeout behavior
   * Requirement: 2.4 - Auto-submit after 10 seconds
   */
  describe('Auto-submit timeout behavior', () => {
    it('displays countdown timer starting at 10 seconds', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      expect(screen.getByText(/Auto-submitting in 10 seconds/i)).toBeInTheDocument()
    })

    it('updates countdown timer every second', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      const timer = screen.getByRole('timer')
      expect(timer.textContent).toContain('Auto-submitting in 10 seconds')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(timer.textContent).toContain('Auto-submitting in 9 seconds')

      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(timer.textContent).toContain('Auto-submitting in 8 seconds')
    })

    it('calls onAutoSubmit after 10 seconds', () => {
      const mockOnChange = vi.fn()
      const mockOnAutoSubmit = vi.fn()
      render(
        <AlertTypeSelector 
          value={null} 
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

    it('respects custom autoSubmitDelay', () => {
      const mockOnChange = vi.fn()
      const mockOnAutoSubmit = vi.fn()
      render(
        <AlertTypeSelector 
          value={null} 
          onChange={mockOnChange}
          onAutoSubmit={mockOnAutoSubmit}
          autoSubmitDelay={5000}
        />
      )

      const timer = screen.getByRole('timer')
      expect(timer.textContent).toContain('Auto-submitting in 5 seconds')

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(mockOnAutoSubmit).toHaveBeenCalledTimes(1)
    })

    it('displays singular "second" when countdown is at 1', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      act(() => {
        vi.advanceTimersByTime(9000)
      })
      const timer = screen.getByRole('timer')
      expect(timer.textContent).toContain('Auto-submitting in 1 second')
      expect(timer.textContent).not.toContain('seconds')
    })
  })

  /**
   * Test: Cancellation
   * Requirement: 2.5 - Allow cancellation before auto-submit
   */
  describe('Cancellation', () => {
    it('renders cancel button by default', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('hides cancel button when showCancel is false', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector 
          value={null} 
          onChange={mockOnChange}
          showCancel={false}
        />
      )

      expect(screen.queryByRole('button', { name: /Cancel/i })).not.toBeInTheDocument()
    })

    it('calls onCancel when cancel button is clicked', () => {
      const mockOnChange = vi.fn()
      const mockOnCancel = vi.fn()
      render(
        <AlertTypeSelector 
          value={null} 
          onChange={mockOnChange}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('stops auto-submit timer when cancelled', () => {
      const mockOnChange = vi.fn()
      const mockOnAutoSubmit = vi.fn()
      const mockOnCancel = vi.fn()
      render(
        <AlertTypeSelector 
          value={null} 
          onChange={mockOnChange}
          onAutoSubmit={mockOnAutoSubmit}
          onCancel={mockOnCancel}
        />
      )

      // Advance time partially
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelButton)

      // Advance remaining time
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      // Auto-submit should not have been called
      expect(mockOnAutoSubmit).not.toHaveBeenCalled()
      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * Test: Keyboard accessibility
   */
  describe('Keyboard accessibility', () => {
    it('allows selecting alert type with Enter key', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      const medicalButton = screen.getByRole('radio', { name: /Medical Emergency/i })
      fireEvent.keyDown(medicalButton, { key: 'Enter' })

      expect(mockOnChange).toHaveBeenCalledWith(AlertType.MEDICAL)
    })

    it('allows selecting alert type with Space key', () => {
      const mockOnChange = vi.fn()
      render(
        <AlertTypeSelector value={null} onChange={mockOnChange} />
      )

      const securityButton = screen.getByRole('radio', { name: /Security Threat/i })
      fireEvent.keyDown(securityButton, { key: ' ' })

      expect(mockOnChange).toHaveBeenCalledWith(AlertType.SECURITY)
    })
  })
})
