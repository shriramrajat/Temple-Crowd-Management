'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

interface UseApiReturn<T, P extends unknown[]> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: P) => Promise<T | null>
  reset: () => void
}

export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = 'An error occurred. Please try again.',
    showSuccessToast = true,
    showErrorToast = true,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await apiFunction(...args)
        setData(result)
        
        if (showSuccessToast && successMessage) {
          toast.success(successMessage)
        }
        
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred')
        setError(error)
        
        if (showErrorToast) {
          toast.error(errorMessage)
        }
        
        onError?.(error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [apiFunction, onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return { data, error, isLoading, execute, reset }
}

// Utility for fetch with error handling
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
