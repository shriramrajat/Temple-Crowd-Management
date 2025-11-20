'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertStatus } from '@/lib/types/sos'
import { 
  Clock,
  CheckCircle2,
  Truck,
  CheckCheck
} from 'lucide-react'

/**
 * Alert Status Configuration
 * Defines the visual representation for each alert status
 * Requirements: 6.1, 6.2, 7.2, 7.5
 */
interface AlertStatusConfig {
  id: AlertStatus
  label: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

/**
 * Alert Status Badge Component Props
 * Requirements: 6.1, 6.2, 7.2, 7.5
 */
export interface AlertStatusBadgeProps {
  /** Current status of the alert */
  status: AlertStatus
  
  /** Size variant of the badge */
  size?: 'sm' | 'md' | 'lg'
  
  /** Whether to show the icon */
  showIcon?: boolean
  
  /** Additional CSS classes */
  className?: string
}

/**
 * Alert status configurations with icons and colors
 * Requirements: 6.1, 6.2, 7.2, 7.5
 */
const STATUS_CONFIGS: Record<AlertStatus, AlertStatusConfig> = {
  [AlertStatus.PENDING]: {
    id: AlertStatus.PENDING,
    label: 'Pending',
    icon: <Clock className="size-3" />,
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  [AlertStatus.ACKNOWLEDGED]: {
    id: AlertStatus.ACKNOWLEDGED,
    label: 'Acknowledged',
    icon: <CheckCircle2 className="size-3" />,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  [AlertStatus.RESPONDING]: {
    id: AlertStatus.RESPONDING,
    label: 'Responding',
    icon: <Truck className="size-3" />,
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  [AlertStatus.RESOLVED]: {
    id: AlertStatus.RESOLVED,
    label: 'Resolved',
    icon: <CheckCheck className="size-3" />,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
}

/**
 * Size configurations for the badge
 */
const SIZE_CONFIGS = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'size-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'size-3.5',
  },
  lg: {
    container: 'px-3 py-1.5 text-base gap-2',
    icon: 'size-4',
  },
}

/**
 * AlertStatusBadge Component
 * 
 * Displays the current status of an SOS alert with color-coded visual indicators.
 * Features:
 * - Color-coded badges for each status (pending, acknowledged, responding, resolved)
 * - Icons for each status
 * - Multiple size variants
 * - Reusable for both pilgrim and admin views
 * - Accessible with ARIA labels
 * - Dark mode support
 * 
 * Requirements: 6.1, 6.2, 7.2, 7.5
 */
export function AlertStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: AlertStatusBadgeProps) {
  const config = STATUS_CONFIGS[status]
  const sizeConfig = SIZE_CONFIGS[size]

  if (!config) {
    console.warn(`Unknown alert status: ${status}`)
    return null
  }

  return (
    <span
      role="status"
      aria-label={`Alert status: ${config.label}`}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md border font-medium',
        'w-fit whitespace-nowrap shrink-0 transition-colors',
        
        // Size-based styles
        sizeConfig.container,
        
        // Status-based colors
        config.color,
        config.bgColor,
        config.borderColor,
        
        className
      )}
    >
      {/* Icon */}
      {showIcon && (
        <span 
          className={cn('shrink-0', sizeConfig.icon)}
          aria-hidden="true"
        >
          {config.icon}
        </span>
      )}
      
      {/* Label */}
      <span className="font-semibold">
        {config.label}
      </span>
    </span>
  )
}

/**
 * Export display name for debugging
 */
AlertStatusBadge.displayName = 'AlertStatusBadge'
