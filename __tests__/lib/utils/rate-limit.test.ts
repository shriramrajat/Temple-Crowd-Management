/**
 * Rate Limiting Utilities Tests
 * 
 * Tests for client-side rate limiting functionality
 * Requirements: 1.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkRateLimit,
  recordAlertSent,
  getRemainingCooldown,
  formatRemainingTime,
  clearRateLimit,
  getTotalAlertCount
} from '@/lib/utils/rate-limit'

describe('Rate Limiting', () => {
  beforeEach(() => {
    // Clear rate limit data before each test
    clearRateLimit()
    // Clear localStorage
    localStorage.clear()
  })

  describe('checkRateLimit', () => {
    it('should allow alert when no previous alerts exist', () => {
      const result = checkRateLimit()
      
      expect(result.allowed).toBe(true)
      expect(result.remainingTime).toBe(0)
      expect(result.lastAlertTime).toBeNull()
    })

    it('should block alert within cooldown period', () => {
      // Record an alert
      recordAlertSent()
      
      // Immediately check rate limit
      const result = checkRateLimit()
      
      expect(result.allowed).toBe(false)
      expect(result.remainingTime).toBeGreaterThan(0)
      expect(result.remainingTime).toBeLessThanOrEqual(60000) // 1 minute
      expect(result.lastAlertTime).toBeGreaterThan(0)
    })

    it('should allow alert after cooldown period', () => {
      // Record an alert with a timestamp 61 seconds ago
      const pastTimestamp = Date.now() - 61000
      localStorage.setItem('sos_rate_limit', JSON.stringify({
        lastAlertTimestamp: pastTimestamp,
        alertCount: 1
      }))
      
      const result = checkRateLimit()
      
      expect(result.allowed).toBe(true)
      expect(result.remainingTime).toBe(0)
    })
  })

  describe('recordAlertSent', () => {
    it('should store alert timestamp in localStorage', () => {
      const beforeTime = Date.now()
      recordAlertSent()
      const afterTime = Date.now()
      
      const data = JSON.parse(localStorage.getItem('sos_rate_limit') || '{}')
      
      expect(data.lastAlertTimestamp).toBeGreaterThanOrEqual(beforeTime)
      expect(data.lastAlertTimestamp).toBeLessThanOrEqual(afterTime)
      expect(data.alertCount).toBe(1)
    })

    it('should increment alert count', () => {
      recordAlertSent()
      expect(getTotalAlertCount()).toBe(1)
      
      // Simulate time passing
      vi.useFakeTimers()
      vi.advanceTimersByTime(61000)
      
      recordAlertSent()
      expect(getTotalAlertCount()).toBe(2)
      
      vi.useRealTimers()
    })
  })

  describe('getRemainingCooldown', () => {
    it('should return 0 when no cooldown is active', () => {
      const remaining = getRemainingCooldown()
      expect(remaining).toBe(0)
    })

    it('should return remaining time during cooldown', () => {
      recordAlertSent()
      
      const remaining = getRemainingCooldown()
      
      expect(remaining).toBeGreaterThan(0)
      expect(remaining).toBeLessThanOrEqual(60000)
    })
  })

  describe('formatRemainingTime', () => {
    it('should format seconds correctly', () => {
      expect(formatRemainingTime(0)).toBe('0 seconds')
      expect(formatRemainingTime(1000)).toBe('1 second')
      expect(formatRemainingTime(5000)).toBe('5 seconds')
      expect(formatRemainingTime(45000)).toBe('45 seconds')
    })

    it('should format minutes correctly', () => {
      expect(formatRemainingTime(60000)).toBe('1 minute')
      expect(formatRemainingTime(120000)).toBe('2 minutes')
      expect(formatRemainingTime(65000)).toBe('2 minutes') // Rounds up
    })

    it('should handle negative values', () => {
      expect(formatRemainingTime(-1000)).toBe('0 seconds')
    })
  })

  describe('clearRateLimit', () => {
    it('should remove rate limit data from localStorage', () => {
      recordAlertSent()
      expect(localStorage.getItem('sos_rate_limit')).not.toBeNull()
      
      clearRateLimit()
      expect(localStorage.getItem('sos_rate_limit')).toBeNull()
    })
  })

  describe('getTotalAlertCount', () => {
    it('should return 0 when no alerts have been sent', () => {
      expect(getTotalAlertCount()).toBe(0)
    })

    it('should return correct count after alerts', () => {
      recordAlertSent()
      expect(getTotalAlertCount()).toBe(1)
    })
  })
})
