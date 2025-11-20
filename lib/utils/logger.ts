/**
 * Enhanced Logging Utility
 * Structured logging for debugging and monitoring
 * Requirement 10.5 - Server-side error logging for debugging
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Log context interface
 */
export interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Log entry interface
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Format log entry
 */
function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, context, error } = entry;
  
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    logMessage += ` | Context: ${JSON.stringify(context)}`;
  }
  
  if (error) {
    logMessage += ` | Error: ${error.name}: ${error.message}`;
    if (error.stack && process.env.NODE_ENV === 'development') {
      logMessage += `\nStack: ${error.stack}`;
    }
  }
  
  return logMessage;
}

/**
 * Create log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
  };
}

/**
 * Logger class
 */
class Logger {
  private minLevel: LogLevel;

  constructor() {
    // Set minimum log level based on environment
    this.minLevel = process.env.NODE_ENV === 'production' 
      ? LogLevel.INFO 
      : LogLevel.DEBUG;
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const minLevelIndex = levels.indexOf(this.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Log message
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = createLogEntry(level, message, context, error);
    const formattedMessage = formatLogEntry(entry);

    // Output to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, you could send logs to external service here
    // e.g., Sentry, LogRocket, CloudWatch, etc.
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Log error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log authentication event
   */
  auth(event: 'login' | 'logout' | 'register' | 'failed_login', context: LogContext): void {
    const messages = {
      login: 'User logged in',
      logout: 'User logged out',
      register: 'User registered',
      failed_login: 'Failed login attempt',
    };

    const level = event === 'failed_login' ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, messages[event], { ...context, event: `auth.${event}` });
  }

  /**
   * Log API request
   */
  apiRequest(method: string, path: string, context?: LogContext): void {
    this.info('API request', {
      method,
      path,
      ...context,
    });
  }

  /**
   * Log API response
   */
  apiResponse(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    const level = statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(level, 'API response', {
      method,
      path,
      statusCode,
      duration,
      ...context,
    });
  }

  /**
   * Log database operation
   */
  database(operation: string, table: string, context?: LogContext, error?: Error): void {
    const level = error ? LogLevel.ERROR : LogLevel.DEBUG;
    
    this.log(level, `Database ${operation}`, {
      operation,
      table,
      ...context,
    }, error);
  }

  /**
   * Log booking event
   */
  booking(event: 'created' | 'cancelled' | 'checked_in', bookingId: string, context?: LogContext): void {
    this.info(`Booking ${event}`, {
      bookingId,
      event: `booking.${event}`,
      ...context,
    });
  }

  /**
   * Log SOS alert
   */
  sosAlert(alertId: string, context?: LogContext): void {
    this.info('SOS alert created', {
      alertId,
      event: 'sos.alert_created',
      ...context,
    });
  }

  /**
   * Log email event
   */
  email(
    event: 'sent' | 'failed',
    recipient: string,
    type: string,
    context?: LogContext,
    error?: Error
  ): void {
    const level = event === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
    
    this.log(level, `Email ${event}`, {
      recipient,
      emailType: type,
      event: `email.${event}`,
      ...context,
    }, error);
  }

  /**
   * Log QR code generation
   */
  qrCode(event: 'generated' | 'verified' | 'failed', bookingId: string, context?: LogContext, error?: Error): void {
    const level = event === 'failed' ? LogLevel.ERROR : LogLevel.INFO;
    
    this.log(level, `QR code ${event}`, {
      bookingId,
      event: `qr.${event}`,
      ...context,
    }, error);
  }

  /**
   * Log rate limit event
   */
  rateLimit(identifier: string, endpoint: string, context?: LogContext): void {
    this.warn('Rate limit exceeded', {
      identifier,
      endpoint,
      event: 'rate_limit.exceeded',
      ...context,
    });
  }

  /**
   * Log security event
   */
  security(event: string, context?: LogContext): void {
    this.warn(`Security event: ${event}`, {
      event: `security.${event}`,
      ...context,
    });
  }
}

/**
 * Export singleton logger instance
 */
export const logger = new Logger();

/**
 * Create child logger with default context
 */
export function createLogger(defaultContext: LogContext): Logger {
  const childLogger = new Logger();
  
  // Override log methods to include default context
  const originalLog = (childLogger as any).log.bind(childLogger);
  (childLogger as any).log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
    originalLog(level, message, { ...defaultContext, ...context }, error);
  };
  
  return childLogger;
}
