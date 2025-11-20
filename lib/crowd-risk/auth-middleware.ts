/**
 * Authorization Middleware
 * 
 * Provides middleware functions for protecting routes and API endpoints.
 * Task 15.1: Implement authorization middleware for permission and role checking
 */

import { NextRequest, NextResponse } from 'next/server';
import { AdminRole, Permission } from './types';
import { getAuthService } from './auth-service';

/**
 * Unauthorized access log entry
 */
interface UnauthorizedAccessLog {
  timestamp: number;
  userId: string | null;
  requiredPermission?: Permission;
  requiredRole?: AdminRole;
  path: string;
  method: string;
}

/**
 * Authorization middleware class
 */
export class AuthMiddleware {
  private unauthorizedAccessLog: UnauthorizedAccessLog[] = [];
  private readonly MAX_LOG_SIZE = 1000;

  /**
   * Log unauthorized access attempt
   */
  private logUnauthorizedAccess(
    userId: string | null,
    path: string,
    method: string,
    requiredPermission?: Permission,
    requiredRole?: AdminRole
  ): void {
    const logEntry: UnauthorizedAccessLog = {
      timestamp: Date.now(),
      userId,
      requiredPermission,
      requiredRole,
      path,
      method,
    };

    this.unauthorizedAccessLog.unshift(logEntry);

    // Limit log size
    if (this.unauthorizedAccessLog.length > this.MAX_LOG_SIZE) {
      this.unauthorizedAccessLog.pop();
    }

    console.warn('Unauthorized access attempt:', logEntry);
  }

  /**
   * Get unauthorized access log
   * 
   * @param limit - Maximum number of entries to return
   * @returns Array of log entries
   */
  getUnauthorizedAccessLog(limit?: number): UnauthorizedAccessLog[] {
    if (limit) {
      return this.unauthorizedAccessLog.slice(0, limit);
    }
    return [...this.unauthorizedAccessLog];
  }

  /**
   * Clear unauthorized access log
   */
  clearLog(): void {
    this.unauthorizedAccessLog = [];
  }

  /**
   * Middleware function to require a specific permission
   * 
   * @param permission - Required permission
   * @returns Middleware function
   */
  requirePermission(permission: Permission) {
    return (userId: string | null, request: NextRequest): NextResponse | null => {
      if (!userId) {
        this.logUnauthorizedAccess(
          null,
          request.nextUrl.pathname,
          request.method,
          permission
        );
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const authService = getAuthService();
      const hasPermission = authService.checkPermission(userId, permission);

      if (!hasPermission) {
        this.logUnauthorizedAccess(
          userId,
          request.nextUrl.pathname,
          request.method,
          permission
        );
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Permission required: ${permission}`,
          },
          { status: 403 }
        );
      }

      return null; // Permission granted
    };
  }

  /**
   * Middleware function to require a specific role
   * 
   * @param role - Required role
   * @returns Middleware function
   */
  requireRole(role: AdminRole) {
    return (userId: string | null, request: NextRequest): NextResponse | null => {
      if (!userId) {
        this.logUnauthorizedAccess(
          null,
          request.nextUrl.pathname,
          request.method,
          undefined,
          role
        );
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const authService = getAuthService();
      const hasRole = authService.hasRole(userId, role);

      if (!hasRole) {
        this.logUnauthorizedAccess(
          userId,
          request.nextUrl.pathname,
          request.method,
          undefined,
          role
        );
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `Role required: ${role}`,
          },
          { status: 403 }
        );
      }

      return null; // Role granted
    };
  }

  /**
   * Middleware function to require any of the specified permissions
   * 
   * @param permissions - Array of permissions (user needs at least one)
   * @returns Middleware function
   */
  requireAnyPermission(permissions: Permission[]) {
    return (userId: string | null, request: NextRequest): NextResponse | null => {
      if (!userId) {
        this.logUnauthorizedAccess(
          null,
          request.nextUrl.pathname,
          request.method,
          permissions[0]
        );
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const authService = getAuthService();
      const hasAnyPermission = authService.hasAnyPermission(userId, permissions);

      if (!hasAnyPermission) {
        this.logUnauthorizedAccess(
          userId,
          request.nextUrl.pathname,
          request.method,
          permissions[0]
        );
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `One of these permissions required: ${permissions.join(', ')}`,
          },
          { status: 403 }
        );
      }

      return null; // Permission granted
    };
  }

  /**
   * Middleware function to require all of the specified permissions
   * 
   * @param permissions - Array of permissions (user needs all)
   * @returns Middleware function
   */
  requireAllPermissions(permissions: Permission[]) {
    return (userId: string | null, request: NextRequest): NextResponse | null => {
      if (!userId) {
        this.logUnauthorizedAccess(
          null,
          request.nextUrl.pathname,
          request.method,
          permissions[0]
        );
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const authService = getAuthService();
      const hasAllPermissions = authService.hasAllPermissions(userId, permissions);

      if (!hasAllPermissions) {
        this.logUnauthorizedAccess(
          userId,
          request.nextUrl.pathname,
          request.method,
          permissions[0]
        );
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: `All of these permissions required: ${permissions.join(', ')}`,
          },
          { status: 403 }
        );
      }

      return null; // Permissions granted
    };
  }
}

/**
 * Singleton instance of AuthMiddleware
 */
let authMiddlewareInstance: AuthMiddleware | null = null;

/**
 * Get singleton instance of AuthMiddleware
 * 
 * @returns AuthMiddleware instance
 */
export function getAuthMiddleware(): AuthMiddleware {
  if (!authMiddlewareInstance) {
    authMiddlewareInstance = new AuthMiddleware();
  }
  return authMiddlewareInstance;
}

/**
 * Reset singleton instance (for testing)
 */
export function resetAuthMiddleware(): void {
  authMiddlewareInstance = null;
}

/**
 * Helper function to extract user ID from request
 * In a real implementation, this would extract from JWT token or session
 * For now, we'll use a header for testing
 * 
 * @param request - Next.js request object
 * @returns User ID or null
 */
export function getUserIdFromRequest(request: NextRequest): string | null {
  // In production, extract from JWT token or session
  // For testing, use X-User-Id header
  return request.headers.get('X-User-Id') || null;
}
