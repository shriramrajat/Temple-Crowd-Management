/**
 * API Error Handler Utility
 * Standardized error handling for API routes
 * Requirements: 10.1, 10.2, 10.5
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AuthError, AuthErrorCode } from '@/lib/types/auth';

/**
 * Standard API error response structure
 */
export interface APIErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  code?: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Error codes for different error types
 */
export enum APIErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  
  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<APIErrorResponse> {
  const errorResponse: APIErrorResponse = {
    error: getErrorTitle(statusCode),
    message,
    statusCode,
    code,
    details,
    timestamp: new Date().toISOString(),
  };

  // Log error for debugging (Requirement 10.5)
  logError(errorResponse);

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Get error title based on status code
 */
function getErrorTitle(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 409:
      return 'Conflict';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    default:
      return 'Error';
  }
}

/**
 * Handle Zod validation errors
 * Requirement 10.3 - Field-specific validation error display
 */
export function handleValidationError(error: ZodError): NextResponse<APIErrorResponse> {
  const fieldErrors: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const field = err.path.join('.');
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(err.message);
  });

  return createErrorResponse(
    400,
    'Validation failed. Please check your input.',
    APIErrorCode.VALIDATION_ERROR,
    { validationErrors: fieldErrors }
  );
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: AuthError): NextResponse<APIErrorResponse> {
  const statusCodeMap: Record<AuthErrorCode, number> = {
    [AuthErrorCode.INVALID_CREDENTIALS]: 401,
    [AuthErrorCode.EMAIL_ALREADY_EXISTS]: 409,
    [AuthErrorCode.ACCOUNT_LOCKED]: 429,
    [AuthErrorCode.INVALID_TOKEN]: 400,
    [AuthErrorCode.TOKEN_EXPIRED]: 400,
    [AuthErrorCode.WEAK_PASSWORD]: 400,
    [AuthErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [AuthErrorCode.INVALID_EMAIL]: 400,
    [AuthErrorCode.USER_NOT_FOUND]: 404,
    [AuthErrorCode.VALIDATION_ERROR]: 400,
  };

  return createErrorResponse(
    statusCodeMap[error.code] || 400,
    error.message,
    error.code
  );
}

/**
 * Handle Prisma database errors
 */
export function handleDatabaseError(error: unknown): NextResponse<APIErrorResponse> {
  // Check if it's a Prisma error by checking for code property
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    
    // Prisma unique constraint violation
    if (prismaError.code === 'P2002') {
      const field = (prismaError.meta?.target as string[])?.join(', ') || 'field';
      return createErrorResponse(
        409,
        `A record with this ${field} already exists.`,
        APIErrorCode.DUPLICATE_RESOURCE,
        { field, prismaCode: prismaError.code }
      );
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      return createErrorResponse(
        404,
        'The requested resource was not found.',
        APIErrorCode.NOT_FOUND,
        { prismaCode: prismaError.code }
      );
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      return createErrorResponse(
        400,
        'Invalid reference to related resource.',
        APIErrorCode.INVALID_INPUT,
        { prismaCode: prismaError.code }
      );
    }
  }

  // Generic database error
  console.error('Database error:', error);
  return createErrorResponse(
    500,
    'A database error occurred. Please try again later.',
    APIErrorCode.DATABASE_ERROR
  );
}

/**
 * Handle generic errors
 * Requirement 10.2 - Descriptive error messages for all failure scenarios
 */
export function handleGenericError(error: unknown): NextResponse<APIErrorResponse> {
  // Handle known error types
  if (error instanceof ZodError) {
    return handleValidationError(error);
  }

  if (error instanceof AuthError) {
    return handleAuthError(error);
  }

  // Check if it's a Prisma error
  if (error && typeof error === 'object' && 'code' in error && typeof (error as any).code === 'string') {
    return handleDatabaseError(error);
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('not found')) {
      return createErrorResponse(
        404,
        error.message,
        APIErrorCode.NOT_FOUND
      );
    }

    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      return createErrorResponse(
        409,
        error.message,
        APIErrorCode.CONFLICT
      );
    }

    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return createErrorResponse(
        401,
        error.message,
        APIErrorCode.UNAUTHORIZED
      );
    }

    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return createErrorResponse(
        403,
        error.message,
        APIErrorCode.FORBIDDEN
      );
    }

    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      return createErrorResponse(
        429,
        error.message,
        APIErrorCode.RATE_LIMIT_EXCEEDED
      );
    }

    // Generic error with message
    console.error('Application error:', error);
    return createErrorResponse(
      500,
      error.message || 'An unexpected error occurred.',
      APIErrorCode.INTERNAL_ERROR
    );
  }

  // Unknown error type
  console.error('Unknown error:', error);
  return createErrorResponse(
    500,
    'An unexpected error occurred. Please try again later.',
    APIErrorCode.INTERNAL_ERROR
  );
}

/**
 * Log error for debugging
 * Requirement 10.5 - Server-side error logging
 */
function logError(errorResponse: APIErrorResponse): void {
  const logLevel = errorResponse.statusCode >= 500 ? 'ERROR' : 'WARN';
  
  console.error(`[${logLevel}] API Error:`, {
    timestamp: errorResponse.timestamp,
    statusCode: errorResponse.statusCode,
    code: errorResponse.code,
    message: errorResponse.message,
    details: errorResponse.details,
  });
}

/**
 * Wrap API route handler with error handling
 * Usage: export const POST = withErrorHandling(async (request) => { ... })
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleGenericError(error);
    }
  };
}

/**
 * Create success response with consistent structure
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  message?: string
): NextResponse {
  const response = {
    success: true,
    ...(message && { message }),
    ...data,
  };

  return NextResponse.json(response, { status: statusCode });
}
