/**
 * Integration tests for end-to-end crowd heatmap data flow
 * Tests the complete flow from API to component rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { CrowdHeatmap } from '@/components/crowd-heatmap'
import type { CrowdDataResponse } from '@/lib/types/crowd-heatmap'

// Mock fetch globally
global.fetch = vi.fn()

describe('Heatmap Integration Flow', () => {
  const mockResponse: CrowdDataResponse = {
    zones: [
      {
        id: 'zone-1',
        name: 'Test Zone 1',
        footfall: 100,
        position: { row: 0, col: 0 },
        capacity: 500,
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
      },
      {
        id: 'zone-2',
        name: 'Test Zone 2',
        footfall: 250,
        position: { row: 0, col: 1 },
        capacity: 500,
        lastUpdated: new Date().toISOString(),
        trend: 'increasing'
      },
      {
        id: 'zone-3',
        name: 'Test Zone 3',
        footfall: 400,
        position: { row: 0, col: 2 },
        capacity: 500,
        lastUpdated: new Date().toISOString(),
        trend: 'decreasing'
      }
    ],
    timestamp: new Date().toISOString(),
    simulationParams: {
      timeOfDay: 'afternoon',
      peakFactor: 1.2
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('fetches and displays zone data on mount', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const { container } = render(<CrowdHeatmap />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/crowd-data',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    await waitFor(() => {
      const zones = container.querySelectorAll('button[aria-label*="people"]')
      expect(zones.length).toBe(3)
    })
  })

  it('applies correct colors based on density levels', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const { container } = render(<CrowdHeatmap />)

    await waitFor(() => {
      const zones = container.querySelectorAll('button[aria-label*="people"]')
      expect(zones.length).toBe(3)
    })

    const zones = container.querySelectorAll('button[aria-label*="people"]')
    
    // Zone 1: 100/500 = 20% < 33% = green
    expect(zones[0].className).toContain('bg-green-500')
    
    // Zone 2: 250/500 = 50% (33-66%) = yellow
    expect(zones[1].className).toContain('bg-yellow-500')
    
    // Zone 3: 400/500 = 80% > 66% = red
    expect(zones[2].className).toContain('bg-red-500')
  })

  it('updates data after polling interval', async () => {
    const updatedResponse: CrowdDataResponse = {
      ...mockResponse,
      zones: mockResponse.zones.map(z => ({
        ...z,
        footfall: z.footfall + 50
      }))
    }

    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => updatedResponse
      })

    render(<CrowdHeatmap refreshInterval={3000} />)

    // Wait for initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // Advance time by 3 seconds
    vi.advanceTimersByTime(3000)

    // Wait for second fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { container } = render(<CrowdHeatmap />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    // Component should still render without crashing
    expect(container).toBeTruthy()
  })

  it('formats footfall numbers correctly in rendered zones', async () => {
    const largeFootfallResponse: CrowdDataResponse = {
      ...mockResponse,
      zones: [
        {
          ...mockResponse.zones[0],
          footfall: 1234
        }
      ]
    }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => largeFootfallResponse
    })

    const { container } = render(<CrowdHeatmap />)

    await waitFor(() => {
      const formattedNumber = container.querySelector('button[aria-label*="1,234"]')
      expect(formattedNumber).toBeTruthy()
    })
  })
})
