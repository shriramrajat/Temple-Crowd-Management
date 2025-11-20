/**
 * Accessibility Utilities
 * 
 * Provides helper functions and constants for ensuring WCAG compliance
 * and keyboard navigation support throughout the SOS system.
 * 
 * Requirements: 1.1, 1.4
 */

/**
 * Minimum touch target size in pixels (WCAG 2.1 Level AAA)
 * iOS: 44x44px, Android: 48x48px
 * We use 48x48px to meet both standards
 */
export const MIN_TOUCH_TARGET_SIZE = 48

/**
 * Focus visible ring configuration for consistent focus indicators
 */
export const FOCUS_VISIBLE_CLASSES = [
  'outline-none',
  'focus-visible:ring-4',
  'focus-visible:ring-primary/50',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
].join(' ')

/**
 * Emergency button focus configuration (higher contrast)
 */
export const EMERGENCY_FOCUS_CLASSES = [
  'outline-none',
  'focus-visible:ring-4',
  'focus-visible:ring-red-300',
  'focus-visible:ring-offset-4',
  'focus-visible:ring-offset-background',
].join(' ')

/**
 * Keyboard event handler for Enter and Space keys
 * Standard pattern for making non-button elements keyboard accessible
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    callback()
  }
}

/**
 * Keyboard event handler for arrow key navigation
 * Used for navigating between options in selectors
 */
export function handleArrowKeyNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void
): void {
  let newIndex = currentIndex

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault()
      newIndex = (currentIndex + 1) % totalItems
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault()
      newIndex = (currentIndex - 1 + totalItems) % totalItems
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

  onNavigate(newIndex)
}

/**
 * Trap focus within a modal or dialog
 * Ensures keyboard users can't tab out of important UI
 */
export function trapFocus(
  containerRef: React.RefObject<HTMLElement>,
  event: React.KeyboardEvent
): void {
  if (event.key !== 'Tab') return

  const container = containerRef.current
  if (!container) return

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }
}

/**
 * Skip to main content link for keyboard navigation
 * Allows keyboard users to bypass navigation
 */
export const SKIP_TO_MAIN_ID = 'main-content'

/**
 * Announce message to screen readers
 * Uses aria-live region for dynamic content announcements
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Check if element meets minimum touch target size
 */
export function meetsMinimumTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE
}

/**
 * Get logical tab order for a container
 * Returns elements in the order they should be tabbed through
 */
export function getTabOrder(container: HTMLElement): HTMLElement[] {
  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )

  // Sort by tabindex if specified
  return focusableElements.sort((a, b) => {
    const aIndex = parseInt(a.getAttribute('tabindex') || '0')
    const bIndex = parseInt(b.getAttribute('tabindex') || '0')
    return aIndex - bIndex
  })
}

/**
 * Keyboard shortcut manager
 */
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  callback: () => void
  description: string
}

export class KeyboardShortcutManager {
  private shortcuts: KeyboardShortcut[] = []
  private listener: ((event: KeyboardEvent) => void) | null = null

  register(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut)
  }

  unregister(key: string): void {
    this.shortcuts = this.shortcuts.filter(s => s.key !== key)
  }

  start(): void {
    if (this.listener) return

    this.listener = (event: KeyboardEvent) => {
      for (const shortcut of this.shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || shortcut.ctrlKey === event.ctrlKey
        const shiftMatch = shortcut.shiftKey === undefined || shortcut.shiftKey === event.shiftKey
        const altMatch = shortcut.altKey === undefined || shortcut.altKey === event.altKey
        const metaMatch = shortcut.metaKey === undefined || shortcut.metaKey === event.metaKey
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase()

        if (ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', this.listener)
  }

  stop(): void {
    if (this.listener) {
      window.removeEventListener('keydown', this.listener)
      this.listener = null
    }
  }

  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts]
  }
}

/**
 * Global keyboard shortcut manager instance
 */
export const globalShortcuts = new KeyboardShortcutManager()
