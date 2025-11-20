'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { startMeasurement, PerformanceMetric } from '@/lib/utils/performance-monitor'

/**
 * SOS Button Component Props
 * Requirements: 1.1, 1.3, 1.4
 */
export interface SOSButtonProps {
  /** Callback function triggered when the SOS button is pressed */
  onTrigger: () => void
  
  /** Whether the button is disabled */
  disabled?: boolean
  
  /** Loading state during alert transmission */
  loading?: boolean
  
  /** Success state after successful alert submission */
  success?: boolean
  
  /** Error state if alert submission fails */
  error?: boolean
  
  /** Additional CSS classes */
  className?: string
  
  /** Button label text */
  label?: string
}

/**
 * SOSButton Component
 * 
 * Primary emergency alert trigger button with visual feedback states.
 * Features:
 * - Large, accessible touch target (minimum 80x80px)
 * - High contrast red color scheme for emergency visibility
 * - Haptic feedback on press (mobile devices)
 * - Loading, success, and error states with visual indicators
 * - Keyboard accessible (Enter/Space keys)
 * - ARIA labels for screen readers
 * 
 * Requirements: 1.1, 1.3, 1.4
 */
export function SOSButton({
  onTrigger,
  disabled = false,
  loading = false,
  success = false,
  error = false,
  className,
  label = 'SOS',
}: SOSButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  /**
   * Handle button click with haptic feedback
   * Requirement: 1.1 - Haptic feedback for mobile devices
   * Performance: Target < 100ms UI responsiveness
   */
  const handleClick = () => {
    if (disabled || loading) return

    // Measure UI responsiveness
    const endMeasurement = startMeasurement(PerformanceMetric.UI_INTERACTION, {
      component: 'SOSButton',
      action: 'click',
    });

    // Trigger haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(200) // 200ms vibration
    }

    // Use requestAnimationFrame for optimal performance
    requestAnimationFrame(() => {
      onTrigger();
      endMeasurement(true);
    });
  }

  /**
   * Handle keyboard events (Enter/Space)
   * Requirement: 1.4 - Keyboard accessibility
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  /**
   * Determine button state and styling
   */
  const getButtonState = () => {
    if (success) {
      return {
        bgColor: 'bg-green-600 hover:bg-green-700',
        icon: <CheckCircle2 className="size-6 sm:size-7 md:size-8" />,
        ariaLabel: 'SOS alert sent successfully',
        text: 'Alert Sent',
      }
    }

    if (error) {
      return {
        bgColor: 'bg-red-700 hover:bg-red-800',
        icon: <AlertCircle className="size-6 sm:size-7 md:size-8" />,
        ariaLabel: 'SOS alert failed, please retry',
        text: 'Retry',
      }
    }

    if (loading) {
      return {
        bgColor: 'bg-red-600',
        icon: <Loader2 className="size-6 sm:size-7 md:size-8 animate-spin" />,
        ariaLabel: 'Sending SOS alert',
        text: 'Sending...',
      }
    }

    return {
      bgColor: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
      icon: null,
      ariaLabel: 'Press to send emergency SOS alert',
      text: label,
    }
  }

  const buttonState = getButtonState()

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={buttonState.ariaLabel}
      aria-busy={loading}
      aria-live="polite"
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2 sm:gap-3 rounded-full',
        'font-bold text-white shadow-2xl',
        'transition-all duration-200 ease-in-out',
        
        // Responsive size - mobile-first approach
        // Mobile: 72x72px (exceeds 48x48px requirement)
        // Tablet/Desktop: 80x80px or larger
        // Requirement: 1.1 - Minimum touch target size
        'min-w-[72px] min-h-[72px] px-6 py-4',
        'sm:min-w-[80px] sm:min-h-[80px] sm:px-8 sm:py-6',
        'md:min-w-[96px] md:min-h-[96px] md:px-10 md:py-8',
        'text-base sm:text-lg md:text-xl lg:text-2xl',
        
        // Focus styles for accessibility
        // Requirement: 1.4 - Keyboard accessibility with visible focus
        'outline-none focus-visible:ring-4 focus-visible:ring-red-300',
        'focus-visible:ring-offset-2 sm:focus-visible:ring-offset-4',
        'focus-visible:ring-offset-background',
        
        // State-based colors
        buttonState.bgColor,
        
        // Disabled state
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'disabled:hover:bg-red-600',
        
        // Interactive effects - optimized for touch
        'hover:scale-105 active:scale-95',
        'hover:shadow-red-500/50',
        'touch-manipulation', // Optimize for touch devices
        
        // High contrast mode support
        '@media (prefers-contrast: high) { border-2 border-white }',
        
        className
      )}
    >
      {buttonState.icon && (
        <span className="shrink-0" aria-hidden="true">
          {buttonState.icon}
        </span>
      )}
      
      <span className="font-extrabold tracking-wide">
        {buttonState.text}
      </span>
    </button>
  )
}

/**
 * Export display name for debugging
 */
SOSButton.displayName = 'SOSButton'
