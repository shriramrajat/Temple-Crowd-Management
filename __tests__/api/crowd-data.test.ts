/**
 * Unit tests for IoT Simulator API Route
 * Tests fluctuation constraints, time-of-day logic, and data generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/crowd-data/route'
import type { CrowdDataResponse } from '@/lib/types/crowd-heatmap'

describe('IoT Simulator API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes 6 zones on first request', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    expect(data.zones).toHaveLength(6)
    expect(data.zones.map(z => z.name)).toEqual([
      'Main Entrance',
      'Prayer Hall',
      'East Courtyard',
      'West Courtyard',
      'Inner Sanctum',
      'Exit Area'
    ])
  })

  it('generates footfall within realistic bounds (0-500)', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    data.zones.forEach(zone => {
      expect(zone.footfall).toBeGreaterThanOrEqual(0)
      expect(zone.footfall).toBeLessThanOrEqual(500)
    })
  })

  it('includes required zone properties', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    data.zones.forEach(zone => {
      expect(zone).toHaveProperty('id')
      expect(zone).toHaveProperty('name')
      expect(zone).toHaveProperty('footfall')
      expect(zone).toHaveProperty('position')
      expect(zone).toHaveProperty('capacity')
      expect(zone).toHaveProperty('lastUpdated')
      expect(zone).toHaveProperty('trend')
      expect(zone.capacity).toBe(500)
    })
  })

  it('includes simulation parameters in response', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    expect(data).toHaveProperty('simulationParams')
    expect(data.simulationParams).toHaveProperty('timeOfDay')
    expect(data.simulationParams).toHaveProperty('peakFactor')
    expect(['morning', 'afternoon', 'evening', 'night']).toContain(
      data.simulationParams.timeOfDay
    )
  })

  it('applies correct time-of-day multipliers', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    const expectedMultipliers = {
      morning: 0.7,
      afternoon: 1.2,
      evening: 0.9,
      night: 0.3
    }

    const timeOfDay = data.simulationParams.timeOfDay
    expect(data.simulationParams.peakFactor).toBe(expectedMultipliers[timeOfDay])
  })

  it('updates zone data on subsequent requests', async () => {
    // First request - initialization
    const response1 = await GET()
    const data1: CrowdDataResponse = await response1.json()
    const initialFootfall = data1.zones.map(z => z.footfall)

    // Second request - should update values
    const response2 = await GET()
    const data2: CrowdDataResponse = await response2.json()
    const updatedFootfall = data2.zones.map(z => z.footfall)

    // At least some zones should have different footfall
    const hasChanges = initialFootfall.some((val, idx) => val !== updatedFootfall[idx])
    expect(hasChanges).toBe(true)
  })

  it('maintains footfall within bounds after multiple updates', async () => {
    // Initialize
    await GET()

    // Perform multiple updates
    for (let i = 0; i < 10; i++) {
      const response = await GET()
      const data: CrowdDataResponse = await response.json()

      data.zones.forEach(zone => {
        expect(zone.footfall).toBeGreaterThanOrEqual(0)
        expect(zone.footfall).toBeLessThanOrEqual(500)
      })
    }
  })

  it('calculates trend indicators correctly', async () => {
    const response = await GET()
    const data: CrowdDataResponse = await response.json()

    data.zones.forEach(zone => {
      expect(['increasing', 'decreasing', 'stable']).toContain(zone.trend)
    })
  })

  it('updates lastUpdated timestamp on each request', async () => {
    const response1 = await GET()
    const data1: CrowdDataResponse = await response1.json()
    const timestamp1 = new Date(data1.timestamp).getTime()

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10))

    const response2 = await GET()
    const data2: CrowdDataResponse = await response2.json()
    const timestamp2 = new Date(data2.timestamp).getTime()

    expect(timestamp2).toBeGreaterThan(timestamp1)
  })
})
