/**
 * Touch Target Validator Component
 * 
 * Development tool to verify that all interactive elements meet
 * minimum touch target size requirements (48x48px).
 * 
 * Only renders in development mode.
 * 
 * Requirements: 1.1
 */

'use client'

import * as React from 'react'
import { MIN_TOUCH_TARGET_SIZE } from '@/lib/utils/accessibility'

export interface TouchTargetValidatorProps {
  /** Whether to enable validation */
  enabled?: boolean
  
  /** Whether to show visual indicators for invalid targets */
  showIndicators?: boolean
}

/**
 * TouchTargetValidator Component
 * 
 * Scans the page for interactive elements and validates their size.
 * Logs warnings for elements that don't meet minimum size requirements.
 */
export function TouchTargetValidator({
  enabled = process.env.NODE_ENV === 'development',
  showIndicators = false,
}: TouchTargetValidatorProps) {
  const [invalidTargets, setInvalidTargets] = React.useState<HTMLElement[]>([])

  React.useEffect(() => {
    if (!enabled) return

    const validateTouchTargets = () => {
      // Select all interactive elements
      const interactiveElements = document.querySelectorAll<HTMLElement>(
        'button, a[href], input, select, textarea, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
      )

      const invalid: HTMLElement[] = []

      interactiveElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        // Check if element meets minimum size
        if (width < MIN_TOUCH_TARGET_SIZE || height < MIN_TOUCH_TARGET_SIZE) {
          invalid.push(element)

          // Log warning in development
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `Touch target too small: ${element.tagName} (${Math.round(width)}x${Math.round(height)}px)`,
              element
            )
          }

          // Add visual indicator if enabled
          if (showIndicators) {
            element.style.outline = '2px dashed red'
            element.style.outlineOffset = '2px'
          }
        }
      })

      setInvalidTargets(invalid)
    }

    // Run validation after page load
    validateTouchTargets()

    // Re-run on window resize
    window.addEventListener('resize', validateTouchTargets)

    return () => {
      window.removeEventListener('resize', validateTouchTargets)

      // Remove visual indicators
      if (showIndicators) {
        invalidTargets.forEach((element) => {
          element.style.outline = ''
          element.style.outlineOffset = ''
        })
      }
    }
  }, [enabled, showIndicators, invalidTargets])

  // Only show summary in development
  if (!enabled || process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded-md shadow-lg text-sm"
      role="status"
      aria-live="polite"
    >
      {invalidTargets.length > 0 ? (
        <div>
          <strong>⚠️ Touch Target Issues:</strong> {invalidTargets.length} element(s) below {MIN_TOUCH_TARGET_SIZE}px
        </div>
      ) : (
        <div>
          <strong>✓ All touch targets valid</strong>
        </div>
      )}
    </div>
  )
}

TouchTargetValidator.displayName = 'TouchTargetValidator'

/**
 * Hook to validate a specific element's touch target size
 */
export function useTouchTargetValidation(ref: React.RefObject<HTMLElement>) {
  const [isValid, setIsValid] = React.useState(true)
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const rect = element.getBoundingClientRect()

    const width = rect.width
    const height = rect.height

    setSize({ width, height })
    setIsValid(width >= MIN_TOUCH_TARGET_SIZE && height >= MIN_TOUCH_TARGET_SIZE)

    if (process.env.NODE_ENV === 'development' && !isValid) {
      console.warn(
        `Touch target validation failed: ${Math.round(width)}x${Math.round(height)}px (minimum: ${MIN_TOUCH_TARGET_SIZE}px)`,
        element
      )
    }
  }, [ref, isValid])

  return { isValid, size }
}
