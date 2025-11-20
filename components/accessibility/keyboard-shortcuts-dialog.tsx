/**
 * Keyboard Shortcuts Dialog Component
 * 
 * Displays available keyboard shortcuts to help users navigate the application.
 * Can be triggered with Shift+? or Ctrl+/
 * 
 * Requirements: 1.4
 */

'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

export interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

export interface KeyboardShortcutsDialogProps {
  /** Whether the dialog is open */
  open: boolean
  
  /** Callback when dialog should close */
  onOpenChange: (open: boolean) => void
  
  /** List of keyboard shortcuts to display */
  shortcuts?: KeyboardShortcut[]
}

/**
 * Default keyboard shortcuts for the SOS system
 */
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    keys: ['Ctrl', 'Shift', 'S'],
    description: 'Open SOS emergency alert',
    category: 'Emergency',
  },
  {
    keys: ['Tab'],
    description: 'Navigate to next element',
    category: 'Navigation',
  },
  {
    keys: ['Shift', 'Tab'],
    description: 'Navigate to previous element',
    category: 'Navigation',
  },
  {
    keys: ['Enter'],
    description: 'Activate focused element',
    category: 'Navigation',
  },
  {
    keys: ['Space'],
    description: 'Activate focused button or checkbox',
    category: 'Navigation',
  },
  {
    keys: ['Arrow Keys'],
    description: 'Navigate between options in selectors',
    category: 'Navigation',
  },
  {
    keys: ['Home'],
    description: 'Jump to first option',
    category: 'Navigation',
  },
  {
    keys: ['End'],
    description: 'Jump to last option',
    category: 'Navigation',
  },
  {
    keys: ['Escape'],
    description: 'Close dialog or cancel action',
    category: 'Navigation',
  },
  {
    keys: ['?'],
    description: 'Show keyboard shortcuts (this dialog)',
    category: 'Help',
  },
]

/**
 * KeyboardShortcutsDialog Component
 * 
 * Displays a modal dialog with all available keyboard shortcuts
 * organized by category.
 */
export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts = DEFAULT_SHORTCUTS,
}: KeyboardShortcutsDialogProps) {
  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {}
    
    shortcuts.forEach(shortcut => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = []
      }
      groups[shortcut.category].push(shortcut)
    })
    
    return groups
  }, [shortcuts])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the application efficiently
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
          <p>
            <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">?</kbd> at any time to view this dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

KeyboardShortcutsDialog.displayName = 'KeyboardShortcutsDialog'

/**
 * Hook to manage keyboard shortcuts dialog
 */
export function useKeyboardShortcutsDialog() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift + ? or Ctrl + /
      if ((event.shiftKey && event.key === '?') || (event.ctrlKey && event.key === '/')) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
