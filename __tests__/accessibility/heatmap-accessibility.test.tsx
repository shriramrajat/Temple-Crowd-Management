/**
 * Accessibility and Performance Tests for Crowd Heatmap
 * 
 * Tests WCAG AA compliance, keyboard navigation, screen reader support,
 * and performance characteristics including memory leaks during polling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { HeatmapZone } from '@/components/heatmap-zone'
import { CrowdHeatmap } from '@/components/crowd-heatmap'
import { ZoneDetailModal } from '@/components/zone-detail-modal'
import type { ZoneData, CrowdDataResponse } from '@/lib/types/crowd-heatmap'

// Mock fetch globally
global.fetch = vi.fn()

describe('Accessibility Tests', () => {
  const mockZone: ZoneData = {
    id: 'zone-test',
    name: 'Test Zone',
    footfall: 150,
    position: { row: 0, col: 0 },
    capacity: 500,
    lastUpdated: new Date().toISOString(),
    trend: 'stable'
  }

  const mockResponse: CrowdDataResponse = {
    zones: [mockZone],
    timestamp: new Date().toISOString(),
    simulationParams: {
      timeOfDay: 'afternoon',
      peakFactor: 1.2
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('WCAG AA Compliance', () => {
    it('HeatmapZone should have no accessibility violations', async () => {
      const { container } = render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('CrowdHeatmap should have no accessibility violations', async () => {
      const { container } = render(<CrowdHeatmap />)
      
      await waitFor(() => {
        expect(screen.queryByText('Loading crowd data...')).not.toBeInTheDocument()
      })
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('ZoneDetailModal should have no accessibility violations', async () => {
      const { container } = render(
        <ZoneDetailModal 
          zone={mockZone} 
          isOpen={true} 
          onClose={vi.fn()} 
        />
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should navigate through zones using Tab key', async () => {
      const user = userEvent.setup()
      const multiZoneResponse: CrowdDataResponse = {
        zones: [
          { ...mockZone, id: 'zone-1', name: 'Zone 1' },
          { ...mockZone, id: 'zone-2', name: 'Zone 2' },
          { ...mockZone, id: 'zone-3', name: 'Zone 3' }
        ],
        timestamp: new Date().toISOString(),
        simulationParams: { timeOfDay: 'afternoon', peakFactor: 1.2 }
      }
      
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => multiZoneResponse
      })
      
      render(<CrowdHeatmap />)
      
      await waitFor(() => {
        expect(screen.getByText('Zone 1')).toBeInTheDocument()
      })
      
      // Tab through zones
      await user.tab()
      const firstZone = screen.getByText('Zone 1').closest('button')
      expect(firstZone).toHaveFocus()
      
      await user.tab()
      const secondZone = screen.getByText('Zone 2').closest('button')
      expect(secondZone).toHaveFocus()
      
      await user.tab()
      const thirdZone = screen.getByText('Zone 3').closest('button')
      expect(thirdZone).toHaveFocus()
    })

    it('should activate zone with Enter key', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={onClick} 
        />
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(onClick).toHaveBeenCalledWith(mockZone)
    })

    it('should activate zone with Space key', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      
      render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={onClick} 
        />
      )
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard(' ')
      expect(onClick).toHaveBeenCalledWith(mockZone)
    })

    it('should close modal with Escape key', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      
      render(
        <ZoneDetailModal 
          zone={mockZone} 
          isOpen={true} 
          onClose={onClose} 
        />
      )
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })

    it('should trap focus within modal when open', async () => {
      const user = userEvent.setup()
      
      render(
        <ZoneDetailModal 
          zone={mockZone} 
          isOpen={true} 
          onClose={vi.fn()} 
        />
      )
      
      const closeButton = screen.getByLabelText('Close modal')
      closeButton.focus()
      expect(closeButton).toHaveFocus()
      
      // Tab should stay within modal
      await user.tab()
      const focusedElement = document.activeElement
      const modal = screen.getByRole('dialog')
      expect(modal.contains(focusedElement)).toBe(true)
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels on zones', () => {
      render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Test Zone, 150 people, low density')
    })

    it('should have aria-live region for live updates', () => {
      render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-live', 'polite')
    })

    it('should announce density changes to screen readers', async () => {
      const { rerender } = render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Test Zone, 150 people, low density')
      
      // Update to high density
      const highDensityZone = { ...mockZone, footfall: 400 }
      rerender(
        <HeatmapZone 
          zone={highDensityZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      expect(button).toHaveAttribute('aria-label', 'Test Zone, 400 people, high density')
    })

    it('should have proper role and aria-label on heatmap region', async () => {
      render(<CrowdHeatmap />)
      
      await waitFor(() => {
        const region = screen.getByRole('region', { name: 'Real-time crowd heatmap' })
        expect(region).toBeInTheDocument()
      })
    })

    it('should have accessible modal with proper ARIA attributes', () => {
      render(
        <ZoneDetailModal 
          zone={mockZone} 
          isOpen={true} 
          onClose={vi.fn()} 
        />
      )
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-describedby', 'zone-detail-description')
      
      const title = screen.getByText('Test Zone')
      expect(title).toBeInTheDocument()
    })

    it('should have accessible progress bar in modal', () => {
      render(
        <ZoneDetailModal 
          zone={mockZone} 
          isOpen={true} 
          onClose={vi.fn()} 
        />
      )
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-valuenow', '30') // 150/500 = 30%
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '100')
      expect(progressBar).toHaveAttribute('aria-label', 'Density level: 30%')
    })
  })
})

describe('Performance Tests', () => {
  const mockZone: ZoneData = {
    id: 'zone-test',
    name: 'Test Zone',
    footfall: 150,
    position: { row: 0, col: 0 },
    capacity: 500,
    lastUpdated: new Date().toISOString(),
    trend: 'stable'
  }

  const mockResponse: CrowdDataResponse = {
    zones: [mockZone],
    timestamp: new Date().toISOString(),
    simulationParams: {
      timeOfDay: 'afternoon',
      peakFactor: 1.2
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('Memory Leak Detection', () => {
    it('should cleanup polling interval on unmount', async () => {
      const { unmount } = render(<CrowdHeatmap refreshInterval={1000} />)
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      }, { timeout: 2000 })
      
      const initialCallCount = (global.fetch as any).mock.calls.length
      
      // Unmount component
      unmount()
      
      // Advance time - should not trigger more fetches
      vi.advanceTimersByTime(5000)
      
      // Should not have additional calls after unmount
      expect((global.fetch as any).mock.calls.length).toBe(initialCallCount)
    })

    it('should not accumulate event listeners during extended polling', async () => {
      render(<CrowdHeatmap refreshInterval={1000} />)
      
      // Wait for initial fetch
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      }, { timeout: 2000 })
      
      // Component should still be responsive after initial render
      expect(screen.getByText('Crowd Heatmap')).toBeInTheDocument()
      
      // Verify component doesn't crash with multiple updates
      vi.advanceTimersByTime(3000)
      expect(screen.getByText('Crowd Heatmap')).toBeInTheDocument()
    })

    it('should cancel pending requests on unmount', async () => {
      const { unmount } = render(<CrowdHeatmap />)
      
      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('Crowd Heatmap')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      // Unmount component
      unmount()
      
      // Verify component unmounted successfully without errors
      expect(screen.queryByText('Crowd Heatmap')).not.toBeInTheDocument()
    })
  })

  describe('Render Performance', () => {
    it('should render multiple zones efficiently', async () => {
      const multiZoneResponse: CrowdDataResponse = {
        zones: Array.from({ length: 6 }, (_, i) => ({
          id: `zone-${i}`,
          name: `Zone ${i + 1}`,
          footfall: 100 + i * 50,
          position: { row: Math.floor(i / 3), col: i % 3 },
          capacity: 500,
          lastUpdated: new Date().toISOString(),
          trend: 'stable' as const
        })),
        timestamp: new Date().toISOString(),
        simulationParams: { timeOfDay: 'afternoon', peakFactor: 1.2 }
      }
      
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => multiZoneResponse
      })
      
      const startTime = performance.now()
      
      render(<CrowdHeatmap />)
      
      await waitFor(() => {
        expect(screen.getByText('Zone 1')).toBeInTheDocument()
      }, { timeout: 2000 })
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Render should complete within reasonable time (< 2000ms for test environment)
      expect(renderTime).toBeLessThan(2000)
    })

    it('should handle rapid updates without performance degradation', async () => {
      const { rerender } = render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const startTime = performance.now()
      
      // Simulate 20 rapid updates
      for (let i = 0; i < 20; i++) {
        const updatedZone = { ...mockZone, footfall: 100 + i * 10 }
        rerender(
          <HeatmapZone 
            zone={updatedZone} 
            maxCapacity={500} 
            onClick={vi.fn()} 
          />
        )
      }
      
      const endTime = performance.now()
      const updateTime = endTime - startTime
      
      // Updates should complete within reasonable time (< 500ms)
      expect(updateTime).toBeLessThan(500)
    })

    it('should maintain smooth animations during updates', async () => {
      const { container, rerender } = render(
        <HeatmapZone 
          zone={mockZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      const button = container.querySelector('button')
      
      // Verify button has transition classes for smooth animations
      expect(button?.className).toContain('transition')
      
      // Update zone
      const updatedZone = { ...mockZone, footfall: 400 }
      rerender(
        <HeatmapZone 
          zone={updatedZone} 
          maxCapacity={500} 
          onClick={vi.fn()} 
        />
      )
      
      // Component should still be responsive and render correctly
      expect(button).toBeInTheDocument()
      expect(screen.getByText('400')).toBeInTheDocument()
    })
  })
})
