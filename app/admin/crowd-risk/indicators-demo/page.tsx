'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IndicatorBadge, AreaMonitoringGrid, IndicatorLegend } from '@/components/admin/crowd-risk'
import { ThresholdLevel, AreaType } from '@/lib/crowd-risk/types'
import type { MonitoredArea, DensityReading } from '@/lib/crowd-risk/types'
import AdminLayout from '@/components/admin/admin-layout'

// Mock data for testing
const mockAreas: MonitoredArea[] = [
  {
    id: 'area-1',
    name: 'Main Entrance',
    location: { latitude: 0, longitude: 0 },
    capacity: 500,
    adjacentAreas: ['area-2'],
    metadata: {
      type: AreaType.ENTRANCE,
      description: 'Primary entrance to the temple complex',
    },
  },
  {
    id: 'area-2',
    name: 'Garbha Griha',
    location: { latitude: 0, longitude: 0 },
    capacity: 200,
    adjacentAreas: ['area-1', 'area-3'],
    metadata: {
      type: AreaType.GATHERING_SPACE,
      description: 'Main sanctum area',
    },
  },
  {
    id: 'area-3',
    name: 'Corridor A',
    location: { latitude: 0, longitude: 0 },
    capacity: 300,
    adjacentAreas: ['area-2', 'area-4'],
    metadata: {
      type: AreaType.CORRIDOR,
      description: 'Main corridor connecting areas',
    },
  },
  {
    id: 'area-4',
    name: 'Exit Gate',
    location: { latitude: 0, longitude: 0 },
    capacity: 400,
    adjacentAreas: ['area-3'],
    metadata: {
      type: AreaType.EXIT,
      description: 'Main exit point',
    },
  },
]

export default function IndicatorsDemoPage() {
  const [densities, setDensities] = useState<Map<string, DensityReading>>(
    new Map([
      ['area-1', { areaId: 'area-1', timestamp: Date.now(), densityValue: 250, unit: 'people_per_sqm' as const }],
      ['area-2', { areaId: 'area-2', timestamp: Date.now(), densityValue: 180, unit: 'people_per_sqm' as const }],
      ['area-3', { areaId: 'area-3', timestamp: Date.now(), densityValue: 280, unit: 'people_per_sqm' as const }],
      ['area-4', { areaId: 'area-4', timestamp: Date.now(), densityValue: 420, unit: 'people_per_sqm' as const }],
    ])
  )

  const [thresholdLevels, setThresholdLevels] = useState<Map<string, ThresholdLevel>>(
    new Map([
      ['area-1', ThresholdLevel.NORMAL],
      ['area-2', ThresholdLevel.WARNING],
      ['area-3', ThresholdLevel.CRITICAL],
      ['area-4', ThresholdLevel.EMERGENCY],
    ])
  )

  const simulateDensityChange = () => {
    const newDensities = new Map<string, DensityReading>()
    const newLevels = new Map<string, ThresholdLevel>()
    
    mockAreas.forEach((area) => {
      const randomDensity = Math.floor(Math.random() * area.capacity * 1.2)
      newDensities.set(area.id, {
        areaId: area.id,
        timestamp: Date.now(),
        densityValue: randomDensity,
        unit: 'people_per_sqm' as const,
      })

      // Determine level based on capacity percentage
      const percentage = (randomDensity / area.capacity) * 100
      let level = ThresholdLevel.NORMAL
      if (percentage >= 100) {
        level = ThresholdLevel.EMERGENCY
      } else if (percentage >= 80) {
        level = ThresholdLevel.CRITICAL
      } else if (percentage >= 60) {
        level = ThresholdLevel.WARNING
      }
      newLevels.set(area.id, level)
    })

    setDensities(newDensities)
    setThresholdLevels(newLevels)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Visual Indicators Demo
            </h1>
            <p className="text-muted-foreground mt-1">
              Testing visual indicator components with live updates
            </p>
          </div>
          <Button onClick={simulateDensityChange}>
            Simulate Density Change
          </Button>
        </div>

        {/* Individual Badge Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Indicator Badge Examples</CardTitle>
            <CardDescription>
              All threshold levels with different sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Small Size */}
            <div>
              <h3 className="text-sm font-medium mb-3">Small Size</h3>
              <div className="flex flex-wrap gap-3">
                <IndicatorBadge level={ThresholdLevel.NORMAL} size="sm" />
                <IndicatorBadge level={ThresholdLevel.WARNING} size="sm" />
                <IndicatorBadge level={ThresholdLevel.CRITICAL} size="sm" />
                <IndicatorBadge level={ThresholdLevel.EMERGENCY} size="sm" />
              </div>
            </div>

            {/* Medium Size */}
            <div>
              <h3 className="text-sm font-medium mb-3">Medium Size (Default)</h3>
              <div className="flex flex-wrap gap-3">
                <IndicatorBadge level={ThresholdLevel.NORMAL} size="md" />
                <IndicatorBadge level={ThresholdLevel.WARNING} size="md" />
                <IndicatorBadge level={ThresholdLevel.CRITICAL} size="md" />
                <IndicatorBadge level={ThresholdLevel.EMERGENCY} size="md" />
              </div>
            </div>

            {/* Large Size */}
            <div>
              <h3 className="text-sm font-medium mb-3">Large Size</h3>
              <div className="flex flex-wrap gap-3">
                <IndicatorBadge level={ThresholdLevel.NORMAL} size="lg" />
                <IndicatorBadge level={ThresholdLevel.WARNING} size="lg" />
                <IndicatorBadge level={ThresholdLevel.CRITICAL} size="lg" />
                <IndicatorBadge level={ThresholdLevel.EMERGENCY} size="lg" />
              </div>
            </div>

            {/* Without Labels */}
            <div>
              <h3 className="text-sm font-medium mb-3">Without Labels</h3>
              <div className="flex flex-wrap gap-3">
                <IndicatorBadge level={ThresholdLevel.NORMAL} showLabel={false} />
                <IndicatorBadge level={ThresholdLevel.WARNING} showLabel={false} />
                <IndicatorBadge level={ThresholdLevel.CRITICAL} showLabel={false} />
                <IndicatorBadge level={ThresholdLevel.EMERGENCY} showLabel={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Area Monitoring Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Area Monitoring Grid</CardTitle>
            <CardDescription>
              Real-time monitoring grid with live density updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaMonitoringGrid
              areas={mockAreas}
              densities={densities}
              thresholdLevels={thresholdLevels}
              onAreaClick={(areaId) => console.log('Area clicked:', areaId)}
            />
          </CardContent>
        </Card>

        {/* Indicator Legend - Card Variant */}
        <IndicatorLegend variant="card" />

        {/* Indicator Legend - Inline Variant */}
        <Card>
          <CardHeader>
            <CardTitle>Inline Legend</CardTitle>
            <CardDescription>
              Compact legend for quick reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IndicatorLegend variant="inline" />
          </CardContent>
        </Card>

        {/* Performance Note */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Performance Note:</strong> All components use React.memo for optimized re-rendering.
              The emergency indicator blinks at 2 Hz (2 cycles per second) as per requirement 4.3.
              State updates render in sub-2-second latency as per requirement 4.4.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
