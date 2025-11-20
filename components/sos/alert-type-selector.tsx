'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertType } from '@/lib/types/sos'
import { 
  Ambulance, 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  HelpCircle,
  X,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomSheet } from '@/components/ui/bottom-sheet'

/**
 * Alert Type Configuration
 * Defines the visual representation and metadata for each alert type
 * Requirements: 2.2
 */
interface AlertTypeConfig {
  id: AlertType
  label: string
  icon: React.ReactNode
  description: string
  color: string
  hoverColor: string
  selectedColor: string
}

/**
 * Alert Type Selector Component Props
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export interface AlertTypeSelectorProps {
  /** Currently selected alert type */
  value: AlertType | null
  
  /** Callback when alert type is selected */
  onChange: (type: AlertType) => void
  
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
 * Alert type configurations with icons and descriptions
 * Requirements: 2.2
 */
const ALERT_TYPES: AlertTypeConfig[] = [
  {
    id: AlertType.MEDICAL,
    label: 'Medical Emergency',
    icon: <Ambulance className="size-8" />,
    description: 'Medical assistance needed',
    color: 'bg-red-50 border-red-200 text-red-900',
    hoverColor: 'hover:bg-red-100 hover:border-red-300',
    selectedColor: 'bg-red-600 border-red-700 text-white',
  },
  {
    id: AlertType.SECURITY,
    label: 'Security Threat',
    icon: <ShieldAlert className="size-8" />,
    description: 'Security or safety concern',
    color: 'bg-orange-50 border-orange-200 text-orange-900',
    hoverColor: 'hover:bg-orange-100 hover:border-orange-300',
    selectedColor: 'bg-orange-600 border-orange-700 text-white',
  },
  {
    id: AlertType.LOST,
    label: 'Lost Person',
    icon: <Search className="size-8" />,
    description: 'Lost or need directions',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    hoverColor: 'hover:bg-blue-100 hover:border-blue-300',
    selectedColor: 'bg-blue-600 border-blue-700 text-white',
  },
  {
    id: AlertType.ACCIDENT,
    label: 'Accident',
    icon: <AlertTriangle className="size-8" />,
    description: 'Accident or injury occurred',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    hoverColor: 'hover:bg-yellow-100 hover:border-yellow-300',
    selectedColor: 'bg-yellow-600 border-yellow-700 text-white',
  },
  {
    id: AlertType.GENERAL,
    label: 'General Assistance',
    icon: <HelpCircle className="size-8" />,
    description: 'Other assistance needed',
    color: 'bg-gray-50 border-gray-200 text-gray-900',
    hoverColor: 'hover:bg-gray-100 hover:border-gray-300',
    selectedColor: 'bg-gray-600 border-gray-700 text-white',
  },
]

/**
 * AlertTypeSelector Component
 * 
 * Allows pilgrims to select the type of emergency they're experiencing.
 * Features:
 * - Grid layout with 5 alert types
 * - Icons and descriptions for each type
 * - Selection state management
 * - 10-second auto-submit countdown timer
 * - Cancellation option before auto-submit
 * - Keyboard accessible
 * - Screen reader support
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */
export function AlertTypeSelector({
  value,
  onChange,
  onAutoSubmit,
  onCancel,
  autoSubmitDelay = 10000,
  showCancel = true,
  useBottomSheet = true,
  className,
}: AlertTypeSelectorProps) {
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
   * Requirement: 2.4 - Auto-submit after 10 seconds
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
   * Handle alert type selection
   * Requirement: 2.3 - Include alert type in transmission
   */
  const handleSelect = (type: AlertType) => {
    onChange(type)
    
    // Provide haptic feedback on selection
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }

  /**
   * Handle keyboard navigation with arrow keys
   * Requirement: 1.4 - Keyboard accessibility with arrow key navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent, type: AlertType, index: number) => {
    // Handle selection with Enter or Space
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect(type)
      return
    }

    // Handle arrow key navigation
    let newIndex = index
    const totalItems = ALERT_TYPES.length

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
   * Requirement: 2.5 - Allow cancellation before auto-submit
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
          Select Emergency Type
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Choose the type of assistance you need
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

      {/* Alert type grid - responsive layout */}
      <div 
        className={cn(
          'grid gap-3 sm:gap-4',
          // Mobile: 1 column for better touch targets
          // Tablet: 2 columns
          // Desktop: 3 columns
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
        role="radiogroup"
        aria-label="Emergency alert types"
        aria-describedby="alert-type-instructions"
      >
        <div id="alert-type-instructions" className="sr-only">
          Use arrow keys to navigate between alert types, Enter or Space to select
        </div>
        {ALERT_TYPES.map((alertType, index) => {
          const isSelected = value === alertType.id
          
          return (
            <button
              key={alertType.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${alertType.label}: ${alertType.description}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => handleSelect(alertType.id)}
              onKeyDown={(e) => handleKeyDown(e, alertType.id, index)}
              className={cn(
                // Base styles
                'flex flex-col items-center gap-2 sm:gap-3 rounded-lg border-2',
                'transition-all duration-200 ease-in-out',
                'cursor-pointer relative',
                
                // Responsive padding - larger touch targets on mobile
                'p-4 sm:p-5 md:p-6',
                'min-h-[80px] sm:min-h-[100px]',
                
                // Touch optimization
                'touch-manipulation',
                
                // Focus styles
                'outline-none focus-visible:ring-4 focus-visible:ring-primary/50',
                'focus-visible:ring-offset-2',
                
                // State-based colors
                isSelected 
                  ? alertType.selectedColor
                  : cn(alertType.color, alertType.hoverColor),
                
                // Interactive effects - optimized for mobile
                'active:scale-95',
                'sm:hover:scale-105',
                'hover:shadow-lg',
                
                // Selected state
                isSelected && 'shadow-xl ring-4 ring-offset-2',
                isSelected && alertType.selectedColor.includes('red') && 'ring-red-300',
                isSelected && alertType.selectedColor.includes('orange') && 'ring-orange-300',
                isSelected && alertType.selectedColor.includes('blue') && 'ring-blue-300',
                isSelected && alertType.selectedColor.includes('yellow') && 'ring-yellow-300',
                isSelected && alertType.selectedColor.includes('gray') && 'ring-gray-300',
              )}
            >
              {/* Icon - responsive sizing */}
              <div 
                className="shrink-0 [&>svg]:size-6 sm:[&>svg]:size-7 md:[&>svg]:size-8"
                aria-hidden="true"
              >
                {alertType.icon}
              </div>
              
              {/* Label - responsive text */}
              <div className="text-center space-y-0.5 sm:space-y-1">
                <div className="font-bold text-sm sm:text-base">
                  {alertType.label}
                </div>
                <div className={cn(
                  'text-xs hidden sm:block',
                  isSelected ? 'text-white/90' : 'text-muted-foreground'
                )}>
                  {alertType.description}
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
        title="Select Emergency Type"
        description="Choose the type of assistance you need"
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
AlertTypeSelector.displayName = 'AlertTypeSelector'
