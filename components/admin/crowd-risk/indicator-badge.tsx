'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ThresholdLevel } from '@/lib/crowd-risk/types'

/**
 * IndicatorBadge Component
 * 
 * Visual indicator badge that displays crowd density status with color-coded severity levels
 * and blinking animation for emergency conditions.
 * 
 * Requirements:
 * - 4.1: Red blinking indicators for critical conditions
 * - 4.2: Color-coded severity levels (green/yellow/red)
 * - 4.3: 2 Hz blink rate for emergency conditions
 * - 4.4: Sub-2-second state update rendering
 */

interface IndicatorBadgeProps {
  level: ThresholdLevel
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const levelConfig = {
  [ThresholdLevel.NORMAL]: {
    color: 'bg-green-500',
    label: 'Normal',
    textColor: 'text-green-700',
    borderColor: 'border-green-500',
  },
  [ThresholdLevel.WARNING]: {
    color: 'bg-yellow-500',
    label: 'Warning',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-500',
  },
  [ThresholdLevel.CRITICAL]: {
    color: 'bg-red-500',
    label: 'Critical',
    textColor: 'text-red-700',
    borderColor: 'border-red-500',
  },
  [ThresholdLevel.EMERGENCY]: {
    color: 'bg-red-600',
    label: 'Emergency',
    textColor: 'text-red-700',
    borderColor: 'border-red-600',
  },
}

const sizeConfig = {
  sm: {
    dot: 'h-2 w-2',
    container: 'gap-1.5 text-xs px-2 py-0.5',
  },
  md: {
    dot: 'h-3 w-3',
    container: 'gap-2 text-sm px-3 py-1',
  },
  lg: {
    dot: 'h-4 w-4',
    container: 'gap-2.5 text-base px-4 py-1.5',
  },
}

export const IndicatorBadge = React.memo(function IndicatorBadge({
  level,
  size = 'md',
  showLabel = true,
  className,
}: IndicatorBadgeProps) {
  const config = levelConfig[level]
  const sizeStyles = sizeConfig[size]
  const isEmergency = level === ThresholdLevel.EMERGENCY

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium transition-all',
        sizeStyles.container,
        config.borderColor,
        config.textColor,
        'bg-background',
        className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {/* Indicator Dot with Emergency Blinking */}
      <span
        className={cn(
          'rounded-full shrink-0',
          sizeStyles.dot,
          config.color,
          isEmergency && 'animate-blink-emergency'
        )}
        aria-hidden="true"
      />
      
      {/* Label */}
      {showLabel && (
        <span className="font-semibold whitespace-nowrap">
          {config.label}
        </span>
      )}
    </div>
  )
})

IndicatorBadge.displayName = 'IndicatorBadge'
