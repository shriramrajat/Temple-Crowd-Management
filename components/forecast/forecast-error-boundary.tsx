'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * ForecastErrorBoundary Component
 * 
 * Error boundary for forecast component tree that catches and handles
 * React errors gracefully.
 * 
 * Features:
 * - Catches errors in child components
 * - Displays user-friendly error message
 * - Provides retry mechanism
 * - Prevents entire app from crashing
 * 
 * Requirement 2.5: Add error boundary for component tree
 * 
 * @example
 * ```tsx
 * <ForecastErrorBoundary>
 *   <ForecastDashboard />
 * </ForecastErrorBoundary>
 * ```
 */
export default class ForecastErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Forecast component error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="rounded-lg border bg-card p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We encountered an error while loading the forecast dashboard.
                    Please try refreshing the page or contact support if the problem persists.
                  </p>
                  {this.state.error && (
                    <details className="mb-4">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        Error details
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {this.state.error.message}
                      </pre>
                    </details>
                  )}
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
