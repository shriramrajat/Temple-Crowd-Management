/**
 * Unit tests for HeatmapZone component
 * Tests color calculation logic and number formatting
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeatmapZone } from '@/components/heatmap-zone'
import type { ZoneData } from '@/lib/types/crowd-heatmap'

describe('HeatmapZone', () => {
  const mockZone: ZoneData = {
    id: 'zone-test',
    name: 'Test Zone',
    footfall: 150,
    position: { row: 0, col: 0 },
    capacity: 500,
    lastUpdated: new Date().toISOString(),
    trend: 'stable'
  }

  const mockOnClick = vi.fn()

  it('renders zone with low density (green)', () => {
    const lowDensityZone = { ...mockZone, footfall: 100 } // 100/500 = 20% < 33%
    const { container } = render(
      <HeatmapZone zone={lowDensityZone} maxCapacity={500} onClick={mockOnClick} />
    )
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-green-500')
  })

  it('renders zone with medium density (yellow)', () => {
    const mediumDensityZone = { ...mockZone, footfall: 250 } // 250/500 = 50% (33-66%)
    const { container } = render(
      <HeatmapZone zone={mediumDensityZone} maxCapacity={500} onClick={mockOnClick} />
    )
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-yellow-500')
  })

  it('renders zone with high density (red)', () => {
    const highDensityZone = { ...mockZone, footfall: 400 } // 400/500 = 80% > 66%
    const { container } = render(
      <HeatmapZone zone={highDensityZone} maxCapacity={500} onClick={mockOnClick} />
    )
    
    const button = container.querySelector('button')
    expect(button?.className).toContain('bg-red-500')
  })

  it('formats footfall numbers with thousand separators', () => {
    const largeFootfallZone = { ...mockZone, footfall: 1234 }
    render(
      <HeatmapZone zone={largeFootfallZone} maxCapacity={2000} onClick={mockOnClick} />
    )
    
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('formats footfall numbers without separators for values < 1000', () => {
    const smallFootfallZone = { ...mockZone, footfall: 456 }
    render(
      <HeatmapZone zone={smallFootfallZone} maxCapacity={500} onClick={mockOnClick} />
    )
    
    expect(screen.getByText('456')).toBeInTheDocument()
  })

  it('displays zone name', () => {
    render(
      <HeatmapZone zone={mockZone} maxCapacity={500} onClick={mockOnClick} />
    )
    
    expect(screen.getByText('Test Zone')).toBeInTheDocument()
  })
})
