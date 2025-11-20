import '@testing-library/jest-dom'
import { expect } from 'vitest'
import { configureAxe } from 'vitest-axe'
import { toHaveNoViolations } from 'vitest-axe/matchers'

// Extend expect with axe matchers
expect.extend({ toHaveNoViolations })

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Ensure WCAG AA compliance
    'color-contrast': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'button-name': { enabled: true },
    'label': { enabled: true },
  },
})
