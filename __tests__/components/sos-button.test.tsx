/**
 * Unit tests for SOSButton component
 * Tests rendering in different states, click and keyboard interactions, and accessibility
 * Requirements: 1.1, 1.3
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from '@/vitest.setup'
import { SOSButton } from '@/components/sos/sos-button'

describe('SOSButton', () => {
  let mockOnTrigger: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnTrigger = vi.fn()
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  /**
   * Test: Rendering in different states
   * Requirement: 1.1 - Visual feedback states
   */
  describe('Rendering in different states', () => {
    it('renders default state with SOS label', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button', { name: /Press to send emergency SOS alert/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('SOS')
      expect(button).not.toBeDisabled()
    })

    it('renders with custom label', () => {
      render(<SOSButton onTrigger={mockOnTrigger} label="Emergency" />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Emergency')
    })

    it('renders loading state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} loading={true} />)

      const button = screen.getByRole('button', { name: /Sending SOS alert/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Sending...')
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('renders success state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} success={true} />)

      const button = screen.getByRole('button', { name: /SOS alert sent successfully/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Alert Sent')
      expect(button).not.toBeDisabled()
    })

    it('renders error state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} error={true} />)

      const button = screen.getByRole('button', { name: /SOS alert failed, please retry/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Retry')
      expect(button).not.toBeDisabled()
    })

    it('renders disabled state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} disabled={true} />)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('applies custom className', () => {
      render(<SOSButton onTrigger={mockOnTrigger} className="custom-class" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  /**
   * Test: Click interactions
   * Requirement: 1.1 - Button functionality and haptic feedback
   */
  describe('Click interactions', () => {
    it('calls onTrigger when clicked', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnTrigger).toHaveBeenCalledTimes(1)
    })

    it('triggers haptic feedback on click', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(navigator.vibrate).toHaveBeenCalledWith(200)
    })

    it('does not call onTrigger when disabled', () => {
      render(<SOSButton onTrigger={mockOnTrigger} disabled={true} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnTrigger).not.toHaveBeenCalled()
    })

    it('does not call onTrigger when loading', () => {
      render(<SOSButton onTrigger={mockOnTrigger} loading={true} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnTrigger).not.toHaveBeenCalled()
    })

    it('allows clicking in success state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} success={true} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnTrigger).toHaveBeenCalledTimes(1)
    })

    it('allows clicking in error state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} error={true} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockOnTrigger).toHaveBeenCalledTimes(1)
    })
  })

  /**
   * Test: Keyboard interactions
   * Requirement: 1.1, 1.4 - Keyboard accessibility
   */
  describe('Keyboard interactions', () => {
    it('calls onTrigger when Enter key is pressed', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(mockOnTrigger).toHaveBeenCalledTimes(1)
    })

    it('calls onTrigger when Space key is pressed', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ' })

      expect(mockOnTrigger).toHaveBeenCalledTimes(1)
    })

    it('triggers haptic feedback on keyboard press', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(navigator.vibrate).toHaveBeenCalledWith(200)
    })

    it('does not call onTrigger for other keys', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'a' })
      fireEvent.keyDown(button, { key: 'Escape' })

      expect(mockOnTrigger).not.toHaveBeenCalled()
    })

    it('does not call onTrigger when disabled and Enter is pressed', () => {
      render(<SOSButton onTrigger={mockOnTrigger} disabled={true} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter' })

      expect(mockOnTrigger).not.toHaveBeenCalled()
    })

    it('does not call onTrigger when loading and Space is pressed', () => {
      render(<SOSButton onTrigger={mockOnTrigger} loading={true} />)

      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ' })

      expect(mockOnTrigger).not.toHaveBeenCalled()
    })
  })

  /**
   * Test: Accessibility
   * Requirement: 1.3 - ARIA labels and screen reader support
   */
  describe('Accessibility', () => {
    it('has proper ARIA label in default state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button', { name: /Press to send emergency SOS alert/i })
      expect(button).toHaveAttribute('aria-label', 'Press to send emergency SOS alert')
    })

    it('has proper ARIA label in loading state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} loading={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Sending SOS alert')
      expect(button).toHaveAttribute('aria-busy', 'true')
    })

    it('has proper ARIA label in success state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} success={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'SOS alert sent successfully')
    })

    it('has proper ARIA label in error state', () => {
      render(<SOSButton onTrigger={mockOnTrigger} error={true} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'SOS alert failed, please retry')
    })

    it('has aria-live region for status announcements', () => {
      render(<SOSButton onTrigger={mockOnTrigger} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-live', 'polite')
    })

    it('passes accessibility checks with axe', async () => {
      const { container } = render(<SOSButton onTrigger={mockOnTrigger} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes accessibility checks in loading state', async () => {
      const { container } = render(<SOSButton onTrigger={mockOnTrigger} loading={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes accessibility checks in success state', async () => {
      const { container } = render(<SOSButton onTrigger={mockOnTrigger} success={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('passes accessibility checks in error state', async () => {
      const { container } = render(<SOSButton onTrigger={mockOnTrigger} error={true} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
})
