/**
 * Authentication Types
 * Shared types for authentication that can be used on both client and server
 */

/**
 * Error codes for authentication operations
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

/**
 * Custom authentication error class
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Input for user registration
 */
export interface RegisterUserInput {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}

/**
 * Result of authentication operation
 */
export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
  sessionToken?: string;
  error?: string;
  errorCode?: AuthErrorCode;
}
