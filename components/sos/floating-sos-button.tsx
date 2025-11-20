'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

/**
 * FloatingSOSButton Component
 * 
 * A floating action button that provides quick access to the SOS emergency system
 * from any page in the application.
 * 
 * Features:
 * - Positioned in bottom-right corner on mobile
 * - Positioned in header area on desktop
 * - Accessible from any page
 * - Keyboard shortcut support (Ctrl+Shift+S)
 * - Doesn't obstruct content
 * - High visibility with red emergency styling
 * - Proper z-index for overlay
 * 
 * Requirements: 1.4
 */
export function FloatingSOSButton() {
  const router = useRouter()
  const [isPressed, setIsPressed] = React.useState(false)

  /**
   * Navigate to SOS page
   */
  const handleSOSClick = () => {
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }

    // Visual feedback
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 200)

    // Navigate to SOS page
    router.push('/sos')
  }

  /**
   * Handle keyboard shortcut (Ctrl+Shift+S)
   * Requirement: 1.4 - Add keyboard shortcut to trigger
   */
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+S (or Cmd+Shift+S on Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        handleSOSClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      {/* Mobile: Bottom-right floating button */}
      <button
        type="button"
        onClick={handleSOSClick}
        aria-label="Emergency SOS - Press to send emergency alert (Ctrl+Shift+S)"
        className={cn(
          // Base styles
          'fixed md:hidden',
          'inline-flex items-center justify-center gap-2',
          'rounded-full shadow-2xl',
          'font-bold text-white',
          'transition-all duration-200 ease-in-out',
          
          // Position - bottom-right corner with safe area
          // Requirement: Position button in bottom-right corner (mobile)
          'bottom-4 right-4 sm:bottom-6 sm:right-6',
          
          // Size - responsive touch target (56px mobile, 64px tablet)
          // Requirement: Ensure button doesn't obstruct content
          'size-14 sm:size-16',
          
          // Colors - emergency red
          'bg-red-600 hover:bg-red-700 active:bg-red-800',
          
          // Z-index for overlay
          // Requirement: Add proper z-index for overlay
          'z-50',
          
          // Touch optimization
          'touch-manipulation',
          
          // Focus styles for accessibility
          'outline-none focus-visible:ring-4 focus-visible:ring-red-300',
          'focus-visible:ring-offset-2',
          
          // Interactive effects
          isPressed ? 'scale-90' : 'active:scale-90 sm:hover:scale-110',
          'hover:shadow-red-500/50',
          
          // Pulse animation to draw attention
          'animate-pulse hover:animate-none active:animate-none'
        )}
      >
        <AlertCircle className="size-6 sm:size-7" aria-hidden="true" />
        <span className="sr-only">SOS</span>
      </button>

      {/* Desktop: Header-style button */}
      <button
        type="button"
        onClick={handleSOSClick}
        aria-label="Emergency SOS - Press to send emergency alert (Ctrl+Shift+S)"
        className={cn(
          // Base styles
          'hidden md:inline-flex',
          'items-center justify-center gap-2',
          'rounded-lg shadow-lg',
          'font-semibold text-white',
          'transition-all duration-200 ease-in-out',
          
          // Size
          'px-4 py-2 min-h-[44px]',
          'text-sm',
          
          // Colors - emergency red
          'bg-red-600 hover:bg-red-700 active:bg-red-800',
          
          // Focus styles for accessibility
          'outline-none focus-visible:ring-4 focus-visible:ring-red-300',
          'focus-visible:ring-offset-2',
          
          // Interactive effects
          isPressed ? 'scale-95' : 'hover:scale-105',
          'hover:shadow-red-500/30'
        )}
      >
        <AlertCircle className="size-5" aria-hidden="true" />
        <span>Emergency SOS</span>
        <span className="text-xs opacity-75 ml-1">(Ctrl+Shift+S)</span>
      </button>
    </>
  )
}

/**
 * Export display name for debugging
 */
FloatingSOSButton.displayName = 'FloatingSOSButton'
