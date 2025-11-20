'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { UrgencyLevel } from '@/lib/types/sos'
import { 
  AlertCircle,
  AlertTriangle,
  Flame,
  Zap,
  X,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomSheet } from '@/components/ui/bottom-sheet'

/**
 * Urgency Level Configuration
 * Defines the visual representation and metadata for each urgency level
 * Requirements: 3.1, 3.4
 */
interface UrgencyLevelConfig {
  id: UrgencyLevel
  label: string
  icon: React.ReactNode
  description: string
  color: string
  hoverColor: string
  selectedColor: string
  ringColor: string
}

/**
 * Urgency Level Selector Component Props
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export interface UrgencyLevelSelectorProps {
  /** Currently selected urgency level */
  value: UrgencyLevel
  
  /** Callback when urgency level is selected */
  onChange: (level: UrgencyLevel) => void
  
  /** Callback when auto-submit timer completes */
  onAutoSubmit?: () => void
  
  /** Callback when user cancels the selection */
  onCancel?: () => void
  
  /** Auto-submit delay in milliseconds (default: 10000ms) */
  autoSubmitDelay?: number
  
  /** Whether to show the cancel button */
  showCancel?: boolean
  
  /** Use bottom sheet on mobile (default: true) */
  useBottomSheet?: boolean
  
  /** Additional CSS classes */
  className?: string
}

/**
 * Urgency level configurations with icons, colors, and descriptions
 * Requirements: 3.1, 3.4
 */
const URGENCY_LEVELS: UrgencyLevelConfig[] = [
  {
    id: UrgencyLevel.LOW,
    label: 'Low',
    icon: <AlertCircle className="size-8" />,
    description: 'Non-urgent assistance',
    color: 'bg-green-50 border-green-200 text-green-900',
    hoverColor: 'hover:bg-green-100 hover:border-green-300',
    selectedColor: 'bg-green-600 border-green-700 text-white',
    ringColor: 'ring-green-300',
  },
  {
    id: UrgencyLevel.MEDIUM,
    label: 'Medium',
    icon: <AlertTriangle className="size-8" />,
    description: 'Moderate urgency',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    hoverColor: 'hover:bg-yellow-100 hover:border-yellow-300',
    selectedColor: 'bg-yellow-600 border-yellow-700 text-white',
    ringColor: 'ring-yellow-300',
  },
  {
    id: UrgencyLevel.HIGH,
    label: 'High',
    icon: <Flame className="size-8" />,
    description: 'Urgent assistance needed',
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    hoverColor: 'hover:bg-orange-100 hover:border-orange-300',
    selectedColor: 'bg-orange-600 border-orange-700 text-white',
    ringColor: 'ring-orange-300',
  },
  {
    id: UrgencyLevel.CRITICAL,
    label: 'Critical',
    icon: <Zap className="size-8" />,
    description: 'Life-threatening emergency',
    color: 'bg-red-50 border-red-200 text-red-900',
    hoverColor: 'hover:bg-red-100 hover:border-red-300',
    selectedColor: 'bg-red-600 border-red-700 text-white',
    ringColor: 'ring-red-300',
  },
]

/**
 * UrgencyLevelSelector Component
 * 
 * Allows pilgrims to select the urgency level of their emergency.
 * Features:
 * - 4 urgency levels with color coding (low, medium, high, critical)
 * - Default level set to "high"
 * - Visual indicators (colors, icons) for each level
 * - Selection state management
 * - 10-second auto-submit with default level
 * - Cancellation option before auto-submit
 * - Keyboard accessible
 * - Screen reader support
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
export function UrgencyLevelSelector({
  value = UrgencyLevel.HIGH, // Default to HIGH per requirement 3.2
  onChange,
  onAutoSubmit,
  onCancel,
  autoSubmitDelay = 10000,
  showCancel = true,
  useBottomSheet = true,
  className,
}: UrgencyLevelSelectorProps) {
  const [timeRemaining, setTimeRemaining] = React.useState(autoSubmitDelay / 1000)
  const [isMobile, setIsMobile] = React.useState(false)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null)

  /**
   * Detect mobile viewport
   */
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  /**
   * Start auto-submit countdown timer
   * Requirement: 3.5 - Auto-submit after 10 seconds with default level
   */
  React.useEffect(() => {
    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Start auto-submit timer
    timerRef.current = setTimeout(() => {
      if (onAutoSubmit) {
        onAutoSubmit()
      }
    }, autoSubmitDelay)

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    }
  }, [autoSubmitDelay, onAutoSubmit])

  /**
   * Handle urgency level selection
   * Requirement: 3.3 - Include urgency level in transmission
   */
  const handleSelect = (level: UrgencyLevel) => {
    onChange(level)
    
    // Provide haptic feedback on selection
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  /**
   * Handle keyboard navigation with arrow keys
   * Requirement: 1.4 - Keyboard accessibility with arrow key navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent, level: UrgencyLevel, index: number) => {
    // Handle selection with Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(level)
      return
    }

    // Handle arrow key navigation
    let newIndex = index
    const totalItems = URGENCY_LEVELS.length

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        newIndex = (index + 1) % totalItems
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        newIndex = (index - 1 + totalItems) % totalItems
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = totalItems - 1
        break
      default:
        return
    }

    // Focus the new element
    const buttons = document.querySelectorAll('[role="radio"]')
    const targetButton = buttons[newIndex] as HTMLElement
    targetButton?.focus()
  }

  /**
   * Handle cancel action
   * Requirement: Allow cancellation before auto-submit
   */
  const handleCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }
    if (onCancel) {
      onCancel()
    }
  }

  /**
   * Render the selector content
   */
  const renderContent = () => (
    <>
      {/* Header with countdown timer */}
      <div className="space-y-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-center">
          Select Urgency Level
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          How urgent is your situation?
        </p>
        
        {/* Countdown timer */}
        <div 
          className="flex items-center justify-center gap-2 text-sm font-medium text-orange-600"
          role="timer"
          aria-live="polite"
          aria-atomic="true"
        >
          <Clock className="size-4" />
          <span>
            Auto-submitting in {timeRemaining} second{timeRemaining !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Urgency level grid - responsive layout */}
      <div 
        className={cn(
          'grid gap-3 sm:gap-4',
          // Mobile: 2 columns for compact layout
          // Desktop: 4 columns for horizontal layout
          'grid-cols-2 sm:grid-cols-4'
        )}
        role="radiogroup"
        aria-label="Emergency urgency levels"
        aria-describedby="urgency-level-instructions"
      >
        <div id="urgency-level-instructions" className="sr-only">
          Use arrow keys to navigate between urgency levels, Enter or Space to select
        </div>
        {URGENCY_LEVELS.map((urgencyLevel, index) => {
          const isSelected = value === urgencyLevel.id
          
          return (
            <button
              key={urgencyLevel.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${urgencyLevel.label} urgency: ${urgencyLevel.description}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelect(urgencyLevel.id)}
              onKeyDown={(e) => handleKeyDown(e, urgencyLevel.id, index)}
              className={cn(
                // Base styles
                'flex flex-col items-center gap-2 sm:gap-3 rounded-lg border-2',
                'transition-all duration-200 ease-in-out',
                'cursor-pointer relative',
                
                // Responsive padding - larger touch targets on mobile
                'p-3 sm:p-4 md:p-6',
                'min-h-[80px] sm:min-h-[100px]',
                
                // Touch optimization
                'touch-manipulation',
                
                // Focus styles
                'outline-none focus-visible:ring-4 focus-visible:ring-primary/50',
                'focus-visible:ring-offset-2',
                
                // State-based colors
                isSelected 
                  ? urgencyLevel.selectedColor
                  : cn(urgencyLevel.color, urgencyLevel.hoverColor),
                
                // Interactive effects - optimized for mobile
                'active:scale-95',
                'sm:hover:scale-105',
                'hover:shadow-lg',
                
                // Selected state
                isSelected && cn('shadow-xl ring-4 ring-offset-2', urgencyLevel.ringColor),
              )}
            >
              {/* Icon - responsive sizing */}
              <div 
                className="shrink-0 [&>svg]:size-6 sm:[&>svg]:size-7 md:[&>svg]:size-8"
                aria-hidden="true"
              >
                {urgencyLevel.icon}
              </div>
              
              {/* Label - responsive text */}
              <div className="text-center space-y-0.5 sm:space-y-1">
                <div className="font-bold text-sm sm:text-base">
                  {urgencyLevel.label}
                </div>
                <div className={cn(
                  'text-xs hidden sm:block',
                  isSelected ? 'text-white/90' : 'text-muted-foreground'
                )}>
                  {urgencyLevel.description}
                </div>
              </div>
              
              {/* Selected indicator */}
              {isSelected && (
                <div 
                  className="absolute top-2 right-2 size-6 rounded-full bg-white/20 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="size-3 rounded-full bg-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Cancel button */}
      {showCancel && (
        <div className="flex justify-center mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="gap-2 min-h-[48px] px-6"
            aria-label="Cancel emergency alert"
          >
            <X className="size-4" />
            Cancel
          </Button>
        </div>
      )}
    </>
  )

  // Use bottom sheet on mobile, regular layout on desktop
  if (useBottomSheet && isMobile) {
    return (
      <BottomSheet
        open={true}
        onClose={handleCancel}
        title="Select Urgency Level"
        description="How urgent is your situation?"
        showCloseButton={showCancel}
      >
        {renderContent()}
      </BottomSheet>
    )
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {renderContent()}
    </div>
  )
}

/**
 * Export display name for debugging
 */
UrgencyLevelSelector.displayName = 'UrgencyLevelSelector'
