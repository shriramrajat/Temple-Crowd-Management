'use client'

import * as React from 'react'
import { Info, AlertTriangle, AlertCircle, Siren } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicatorBadge } from './indicator-badge'
import { ThresholdLevel } from '@/lib/crowd-risk/types'
import { cn } from '@/lib/utils'

/**
 * IndicatorLegend Component
 * 
 * Displays a legend explaining the meaning of each indicator status level
 * with descriptions and visual examples.
 * 
 * Requirements:
 * - 4.1: Explain red blinking indicators
 * - 4.2: Explain color-coded severity levels
 * - 4.3: Explain 2 Hz blink rate for emergency
 */

interface IndicatorLegendProps {
  variant?: 'card' | 'inline'
  className?: string
}

interface LegendItem {
  level: ThresholdLevel
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action: string
}

const legendItems: LegendItem[] = [
  {
    level: ThresholdLevel.NORMAL,
    icon: Info,
    title: 'Normal',
    description: 'Crowd density is within safe limits',
    action: 'Continue regular monitoring',
  },
  {
    level: ThresholdLevel.WARNING,
    icon: AlertTriangle,
    title: 'Warning',
    description: 'Crowd density is approaching threshold limits',
    action: 'Increase monitoring frequency and prepare response',
  },
  {
    level: ThresholdLevel.CRITICAL,
    icon: AlertCircle,
    title: 'Critical',
    description: 'Crowd density has exceeded safe threshold',
    action: 'Immediate attention required, implement crowd control',
  },
  {
    level: ThresholdLevel.EMERGENCY,
    icon: Siren,
    title: 'Emergency',
    description: 'Dangerous crowd density detected with blinking indicator (2 Hz)',
    action: 'Emergency response activated, evacuate or redirect crowd',
  },
]

const InlineLegend = React.memo(function InlineLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-4', className)}>
      {legendItems.map((item) => (
        <div key={item.level} className="flex items-center gap-2">
          <IndicatorBadge level={item.level} size="sm" showLabel={false} />
          <span className="text-sm text-muted-foreground">{item.title}</span>
        </div>
      ))}
    </div>
  )
})

InlineLegend.displayName = 'InlineLegend'

const CardLegend = React.memo(function CardLegend({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-card/50 border-border/50 backdrop-blur-sm', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Status Indicator Legend
        </CardTitle>
        <CardDescription>
          Understanding crowd density alert levels and recommended actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {legendItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.level}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Icon and Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <IndicatorBadge level={item.level} size="sm" showLabel={false} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    {item.level === ThresholdLevel.EMERGENCY && (
                      <span className="text-xs text-red-600 font-medium animate-pulse">
                        BLINKING
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  <p className="text-xs text-foreground/80 font-medium mt-1.5">
                    → {item.action}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Indicators update in real-time (sub-2-second latency). Emergency indicators blink at
              2 cycles per second to ensure maximum visibility. All threshold violations trigger
              automatic notifications to administrators and affected pilgrims.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

CardLegend.displayName = 'CardLegend'

export const IndicatorLegend = React.memo(function IndicatorLegend({
  variant = 'card',
  className,
}: IndicatorLegendProps) {
  if (variant === 'inline') {
    return <InlineLegend className={className} />
  }

  return <CardLegend className={className} />
})

IndicatorLegend.displayName = 'IndicatorLegend'
