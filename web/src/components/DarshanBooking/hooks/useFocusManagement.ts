import { useEffect, useRef, useCallback } from 'react';

interface UseFocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
}

/**
 * Custom hook for managing focus within a component
 * Provides focus trapping, restoration, and auto-focus capabilities
 */
export const useFocusManagement = (
  isActive: boolean = true,
  options: UseFocusManagementOptions = {}
) => {
  const {
    trapFocus = false,
    restoreFocus = false,
    autoFocus = false
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !trapFocus) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentElement = document.activeElement as HTMLElement;

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab (backward)
        if (currentElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab (forward)
        if (currentElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (event.key === 'Escape') {
      // Allow escape to break focus trap
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isActive, trapFocus, restoreFocus, getFocusableElements]);

  // Focus the first focusable element
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  // Focus the last focusable element
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  // Focus a specific element by selector or index
  const focusElement = useCallback((selector: string | number) => {
    if (!containerRef.current) return;

    let element: HTMLElement | null = null;

    if (typeof selector === 'string') {
      element = containerRef.current.querySelector(selector) as HTMLElement;
    } else if (typeof selector === 'number') {
      const focusableElements = getFocusableElements();
      element = focusableElements[selector] || null;
    }

    if (element) {
      element.focus();
    }
  }, [getFocusableElements]);

  // Set up focus management when component becomes active
  useEffect(() => {
    if (!isActive) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus the first element if requested
    if (autoFocus) {
      // Use setTimeout to ensure the component is fully rendered
      const timeoutId = setTimeout(() => {
        focusFirst();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [isActive, autoFocus, restoreFocus, focusFirst]);

  // Set up keyboard event listeners for focus trapping
  useEffect(() => {
    if (!isActive || !trapFocus) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, trapFocus, handleKeyDown]);

  // Restore focus when component becomes inactive
  useEffect(() => {
    return () => {
      if (restoreFocus && previousFocusRef.current) {
        // Use setTimeout to ensure the component is fully unmounted
        setTimeout(() => {
          if (previousFocusRef.current) {
            previousFocusRef.current.focus();
          }
        }, 0);
      }
    };
  }, [restoreFocus]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusElement,
    getFocusableElements
  };
};