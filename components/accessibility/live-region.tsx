/**
 * Live Region Component
 * 
 * Provides ARIA live regions for announcing dynamic content changes
 * to screen readers without requiring user focus.
 * 
 * Requirements: 1.3, 6.1, 6.4
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LiveRegionProps {
  /** The message to announce */
  message: string
  
  /** Priority level for announcements */
  priority?: 'polite' | 'assertive'
  
  /** Whether to announce atomic changes */
  atomic?: boolean
  
  /** Additional CSS classes */
  className?: string
}

/**
 * LiveRegion Component
 * 
 * Creates an ARIA live region that announces messages to screen readers.
 * The component is visually hidden but accessible to assistive technologies.
 * 
 * Usage:
 * - 'polite': Waits for user to finish current task (default)
 * - 'assertive': Interrupts immediately (use for errors/urgent messages)
 */
export function LiveRegion({
  message,
  priority = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  )
}

LiveRegion.displayName = 'LiveRegion'

/**
 * Hook for managing live region announcements
 * 
 * Provides a simple API for announcing messages to screen readers
 * with automatic cleanup after announcement.
 */
export function useLiveRegion() {
  const [message, setMessage] = React.useState('')
  const [priority, setPriority] = React.useState<'polite' | 'assertive'>('polite')
  const timeoutRef = React.useRef<NodeJS.Timeout>()

  const announce = React.useCallback((
    newMessage: string,
    newPriority: 'polite' | 'assertive' = 'polite'
  ) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set the new message
    setMessage(newMessage)
    setPriority(newPriority)

    // Clear the message after 1 second to allow re-announcement
    timeoutRef.current = setTimeout(() => {
      setMessage('')
    }, 1000)
  }, [])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    message,
    priority,
    announce,
    LiveRegionComponent: () => message ? (
      <LiveRegion message={message} priority={priority} />
    ) : null,
  }
}

/**
 * Status Announcer Component
 * 
 * A specialized live region for status updates (loading, success, error).
 * Automatically manages announcements for common UI states.
 */
export interface StatusAnnouncerProps {
  /** Current status */
  status: 'idle' | 'loading' | 'success' | 'error'
  
  /** Custom messages for each status */
  messages?: {
    loading?: string
    success?: string
    error?: string
  }
  
  /** Additional CSS classes */
  className?: string
}

export function StatusAnnouncer({
  status,
  messages = {},
  className,
}: StatusAnnouncerProps) {
  const defaultMessages = {
    loading: messages.loading || 'Loading...',
    success: messages.success || 'Success',
    error: messages.error || 'Error occurred',
  }

  const getMessage = () => {
    switch (status) {
      case 'loading':
        return defaultMessages.loading
      case 'success':
        return defaultMessages.success
      case 'error':
        return defaultMessages.error
      default:
        return ''
    }
  }

  const getPriority = (): 'polite' | 'assertive' => {
    return status === 'error' ? 'assertive' : 'polite'
  }

  const message = getMessage()

  if (!message) return null

  return (
    <LiveRegion
      message={message}
      priority={getPriority()}
      className={className}
    />
  )
}

StatusAnnouncer.displayName = 'StatusAnnouncer'
