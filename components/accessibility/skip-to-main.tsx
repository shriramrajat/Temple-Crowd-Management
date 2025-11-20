/**
 * Skip to Main Content Component
 * 
 * Provides a keyboard-accessible link that allows users to skip
 * navigation and jump directly to the main content.
 * 
 * This is a WCAG 2.1 Level A requirement for keyboard accessibility.
 * 
 * Requirements: 1.4
 */

'use client'

import { cn } from '@/lib/utils'

export interface SkipToMainProps {
  /** ID of the main content element to skip to */
  targetId?: string
  
  /** Custom label for the skip link */
  label?: string
  
  /** Additional CSS classes */
  className?: string
}

/**
 * SkipToMain Component
 * 
 * Renders a visually hidden link that becomes visible when focused.
 * Allows keyboard users to bypass navigation and go directly to main content.
 */
export function SkipToMain({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: SkipToMainProps) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Visually hidden by default
        'sr-only',
        
        // Visible when focused
        'focus:not-sr-only',
        'focus:absolute',
        'focus:top-4',
        'focus:left-4',
        'focus:z-[100]',
        
        // Styling when visible
        'focus:inline-block',
        'focus:px-4',
        'focus:py-2',
        'focus:bg-primary',
        'focus:text-primary-foreground',
        'focus:rounded-md',
        'focus:font-semibold',
        'focus:shadow-lg',
        
        // Focus ring
        'focus:outline-none',
        'focus:ring-4',
        'focus:ring-primary/50',
        'focus:ring-offset-2',
        
        className
      )}
    >
      {label}
    </a>
  )
}

SkipToMain.displayName = 'SkipToMain'
