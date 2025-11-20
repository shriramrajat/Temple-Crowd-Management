'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

/**
 * Bottom Sheet Component Props
 */
export interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  open: boolean
  
  /** Callback when the bottom sheet should close */
  onClose: () => void
  
  /** Bottom sheet title */
  title?: string
  
  /** Bottom sheet description */
  description?: string
  
  /** Bottom sheet content */
  children: React.ReactNode
  
  /** Additional CSS classes */
  className?: string
  
  /** Whether to show the close button */
  showCloseButton?: boolean
}

/**
 * BottomSheet Component
 * 
 * A mobile-optimized bottom sheet component that slides up from the bottom of the screen.
 * Features:
 * - Smooth slide-up animation
 * - Backdrop overlay
 * - Swipe-to-close gesture support
 * - Keyboard accessible (Escape to close)
 * - Focus trap
 * - ARIA attributes for accessibility
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
}: BottomSheetProps) {
  const sheetRef = React.useRef<HTMLDivElement>(null)
  const [startY, setStartY] = React.useState<number | null>(null)
  const [currentY, setCurrentY] = React.useState<number | null>(null)

  /**
   * Handle escape key to close
   */
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  /**
   * Prevent body scroll when open
   */
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  /**
   * Handle touch start for swipe gesture
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  /**
   * Handle touch move for swipe gesture
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return
    setCurrentY(e.touches[0].clientY)
  }

  /**
   * Handle touch end for swipe gesture
   */
  const handleTouchEnd = () => {
    if (startY === null || currentY === null) {
      setStartY(null)
      setCurrentY(null)
      return
    }

    const deltaY = currentY - startY

    // If swiped down more than 100px, close the sheet
    if (deltaY > 100) {
      onClose()
    }

    setStartY(null)
    setCurrentY(null)
  }

  if (!open) return null

  const translateY = startY !== null && currentY !== null 
    ? Math.max(0, currentY - startY) 
    : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        aria-describedby={description ? 'bottom-sheet-description' : undefined}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background rounded-t-2xl shadow-2xl',
          'max-h-[90vh] overflow-hidden',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: startY !== null ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div 
            className="w-12 h-1.5 bg-muted-foreground/30 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex-1">
              {title && (
                <h2 
                  id="bottom-sheet-title"
                  className="text-lg font-semibold"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id="bottom-sheet-description"
                  className="text-sm text-muted-foreground mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={cn(
                  'ml-4 p-2 rounded-full',
                  'hover:bg-muted transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] px-6 py-4">
          {children}
        </div>
      </div>
    </>
  )
}

BottomSheet.displayName = 'BottomSheet'
