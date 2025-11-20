import { NextResponse } from 'next/server'

/**
 * Standard API error response structure
 */
export interface APIErrorResponse {
  error: string
  message: string
  statusCode: number
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  error: string = 'Internal Server Error'
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
    },
    { status: statusCode }
  )
}

/**
 * Handle API errors with proper logging and response
 */
export function handleAPIError(err: unknown, context?: string): NextResponse<APIErrorResponse> {
  console.error(`API Error${context ? ` in ${context}` : ''}:`, err)

  if (err instanceof Error) {
    // Known error types
    if (err.message.includes('not found') || err.message.includes('does not exist')) {
      return createErrorResponse(err.message, 404, 'Not Found')
    }
    
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      return createErrorResponse(err.message, 409, 'Conflict')
    }
    
    if (err.message.includes('invalid') || err.message.includes('validation')) {
      return createErrorResponse(err.message, 400, 'Bad Request')
    }
    
    if (err.message.includes('unauthorized') || err.message.includes('permission')) {
      return createErrorResponse(err.message, 403, 'Forbidden')
    }

    // Generic error
    return createErrorResponse(err.message, 500, 'Internal Server Error')
  }

  // Unknown error type
  return createErrorResponse('An unexpected error occurred', 500, 'Internal Server Error')
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): { valid: boolean; error?: NextResponse<APIErrorResponse> } {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        400,
        'Bad Request'
      ),
    }
  }
  
  return { valid: true }
}

/**
 * Success response helper
 */
export function createSuccessResponse<T>(data: T, statusCode: number = 200): NextResponse<T> {
  return NextResponse.json(data, { status: statusCode })
}
