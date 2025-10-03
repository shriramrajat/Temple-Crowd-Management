import { ErrorInfo } from 'react';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  environment: string;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  attempt?: number;
  maxRetries?: number;
  operation?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private context: ErrorContext = {};
  private isInitialized = false;

  initialize(context: Partial<ErrorContext> = {}) {
    this.context = { ...this.context, ...context };
    this.isInitialized = true;
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  setContext(context: Partial<ErrorContext>) {
    this.context = { ...this.context, ...context };
  }

  captureException(error: Error, errorInfo?: ErrorInfo, additionalContext?: Partial<ErrorContext>) {
    const errorReport = this.createErrorReport(error, errorInfo, additionalContext);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }

    // Send to error reporting service
    this.sendToReportingService(errorReport);
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'error', context?: Partial<ErrorContext>) {
    const errorReport: ErrorReport = {
      message,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      ...this.context,
      ...context,
    };

    if (process.env.NODE_ENV === 'development') {
      if (level === 'warning') {
        console.warn('Message captured:', errorReport);
      } else {
        console[level]('Message captured:', errorReport);
      }
    }

    this.sendToReportingService(errorReport);
  }

  private createErrorReport(
    error: Error, 
    errorInfo?: ErrorInfo, 
    additionalContext?: Partial<ErrorContext>
  ): ErrorReport {
    return {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack || undefined,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
      ...this.context,
      ...additionalContext,
    };
  }

  private sendToReportingService(errorReport: ErrorReport) {
    // TODO: Implement actual error reporting service integration
    // Examples:
    // - Sentry: Sentry.captureException(error, { extra: errorReport });
    // - LogRocket: LogRocket.captureException(error);
    // - Custom API: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    
    // For now, just log to console
    console.error('Error Report (would be sent to service):', errorReport);
    
    // Store in localStorage for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      try {
        const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
        existingErrors.push(errorReport);
        // Keep only last 50 errors
        const recentErrors = existingErrors.slice(-50);
        localStorage.setItem('errorReports', JSON.stringify(recentErrors));
      } catch (e) {
        console.warn('Failed to store error report in localStorage:', e);
      }
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        const error = event.reason instanceof Error 
          ? event.reason 
          : new Error(String(event.reason));
          
        this.captureException(error, undefined, {
          feature: 'global',
          action: 'unhandled_promise_rejection',
        });
      });

      // Handle global JavaScript errors
      window.addEventListener('error', (event) => {
        console.error('Global JavaScript error:', event.error);
        
        const error = event.error instanceof Error 
          ? event.error 
          : new Error(event.message);
          
        this.captureException(error, undefined, {
          feature: 'global',
          action: 'javascript_error',
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });
    }
  }

  // Utility method to get stored error reports (development only)
  getStoredErrorReports(): ErrorReport[] {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    
    try {
      return JSON.parse(localStorage.getItem('errorReports') || '[]');
    } catch (e) {
      console.warn('Failed to retrieve error reports from localStorage:', e);
      return [];
    }
  }

  // Clear stored error reports (development only)
  clearStoredErrorReports() {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('errorReports');
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

