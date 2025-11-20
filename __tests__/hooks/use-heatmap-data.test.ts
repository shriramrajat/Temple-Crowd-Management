/**
 * Unit tests for useHeatmapData hook
 * Tests polling, cleanup behavior, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useHeatmapData } from '@/hooks/use-heatmap-data'
import type { CrowdDataResponse } from '@/lib/types/crowd-heatmap'

// Mock fetch globally
global.fetch = vi.fn()

describe('useHeatmapData', () => {
  const mockResponse: CrowdDataResponse = {
    zones: [
      {
        id: 'zone-1',
        name: 'Zone 1',
        footfall: 100,
        position: { row: 0, col: 0 },
        capacity: 500,
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
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

  it('fetches data on mount', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const { result } = renderHook(() => useHeatmapData(3000))

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.zones).toEqual(mockResponse.zones)
    expect(result.current.error).toBeNull()
  })

  it('polls data at specified interval', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    renderHook(() => useHeatmapData(3000))

    // Initial fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    // Advance time by 3 seconds
    vi.advanceTimersByTime(3000)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('cleans up on unmount', async () => {
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    })

    const { unmount } = renderHook(() => useHeatmapData(3000))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    unmount()

    // Advance time - should not trigger another fetch
    vi.advanceTimersByTime(3000)

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('handles fetch errors', async () => {
    const errorMessage = 'Network error'
    ;(global.fetch as any).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useHeatmapData(3000))

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
      expect(result.current.error?.message).toBe(errorMessage)
    })
  })
})
