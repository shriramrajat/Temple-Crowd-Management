/**
 * API Authentication Middleware
 * 
 * Provides authentication and authorization for API endpoints.
 * Task 15.2: Implement API authentication middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthService } from './auth-service';
import { Permission } from './types';

/**
 * API Key storage
 * In production, this should be stored in a database
 */
interface ApiKey {
  key: string;
  name: string;
  permissions: Permission[];
  createdAt: number;
  expiresAt?: number;
  lastUsed?: number;
}

/**
 * API Key Manager
 */
class ApiKeyManager {
  private apiKeys: Map<string, ApiKey> = new Map();

  constructor() {
    // Initialize with default API keys for testing
    this.initializeDefaultKeys();
  }

  /**
   * Initialize default API keys for testing
   */
  private initializeDefaultKeys(): void {
    const defaultKeys: ApiKey[] = [
      {
        key: 'test_super_admin_key_12345',
        name: 'Test Super Admin Key',
        permissions: [
          Permission.CONFIGURE_THRESHOLDS,
          Permission.ACTIVATE_EMERGENCY,
          Permission.MANAGE_USERS,
          Permission.ACKNOWLEDGE_ALERTS,
          Permission.VIEW_ANALYTICS,
          Permission.VIEW_ONLY,
        ],
        createdAt: Date.now(),
      },
      {
        key: 'test_safety_admin_key_67890',
        name: 'Test Safety Admin Key',
        permissions: [
          Permission.CONFIGURE_THRESHOLDS,
          Permission.ACTIVATE_EMERGENCY,
          Permission.ACKNOWLEDGE_ALERTS,
          Permission.VIEW_ANALYTICS,
          Permission.VIEW_ONLY,
        ],
        createdAt: Date.now(),
      },
      {
        key: 'test_monitor_key_abcde',
        name: 'Test Monitor Key',
        permissions: [Permission.VIEW_ONLY, Permission.VIEW_ANALYTICS],
        createdAt: Date.now(),
      },
    ];

    defaultKeys.forEach(key => {
      this.apiKeys.set(key.key, key);
    });
  }

  /**
   * Generate a new API key
   * 
   * @param name - Name/description for the API key
   * @param permissions - Permissions to grant
   * @param expiresInDays - Optional expiration in days
   * @returns Generated API key
   */
  generateApiKey(
    name: string,
    permissions: Permission[],
    expiresInDays?: number
  ): string {
    const key = `api_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const apiKey: ApiKey = {
      key,
      name,
      permissions,
      createdAt: Date.now(),
      expiresAt: expiresInDays
        ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000
        : undefined,
    };

    this.apiKeys.set(key, apiKey);
    return key;
  }

  /**
   * Validate an API key
   * 
   * @param key - API key to validate
   * @returns ApiKey object if valid, null otherwise
   */
  validateApiKey(key: string): ApiKey | null {
    const apiKey = this.apiKeys.get(key);

    if (!apiKey) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return null;
    }

    // Update last used timestamp
    apiKey.lastUsed = Date.now();

    return apiKey;
  }

  /**
   * Check if API key has permission
   * 
   * @param key - API key
   * @param permission - Permission to check
   * @returns True if key has permission
   */
  hasPermission(key: string, permission: Permission): boolean {
    const apiKey = this.validateApiKey(key);
    return apiKey ? apiKey.permissions.includes(permission) : false;
  }

  /**
   * Revoke an API key
   * 
   * @param key - API key to revoke
   * @returns True if key was revoked
   */
  revokeApiKey(key: string): boolean {
    return this.apiKeys.delete(key);
  }

  /**
   * Get all API keys
   * 
   * @returns Array of API keys (without the actual key value)
   */
  getAllApiKeys(): Omit<ApiKey, 'key'>[] {
    return Array.from(this.apiKeys.values()).map(({ key, ...rest }) => rest);
  }
}

/**
 * Singleton instance
 */
let apiKeyManagerInstance: ApiKeyManager | null = null;

/**
 * Get singleton instance of ApiKeyManager
 */
export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManagerInstance) {
    apiKeyManagerInstance = new ApiKeyManager();
  }
  return apiKeyManagerInstance;
}

/**
 * Reset singleton instance (for testing)
 */
export function resetApiKeyManager(): void {
  apiKeyManagerInstance = null;
}

/**
 * Verify API key from request
 * 
 * @param request - Next.js request object
 * @returns API key object if valid, null otherwise
 */
export function verifyApiKey(request: NextRequest): ApiKey | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const key = authHeader.substring(7);
    const apiKeyManager = getApiKeyManager();
    return apiKeyManager.validateApiKey(key);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  
  if (apiKeyHeader) {
    const apiKeyManager = getApiKeyManager();
    return apiKeyManager.validateApiKey(apiKeyHeader);
  }

  return null;
}

/**
 * Verify JWT token (placeholder for future implementation)
 * 
 * @param request - Next.js request object
 * @returns User ID if valid, null otherwise
 */
export function verifyJWT(request: NextRequest): string | null {
  // TODO: Implement JWT verification
  // For now, check X-User-Id header (development only)
  const userId = request.headers.get('X-User-Id');
  
  if (userId) {
    const authService = getAuthService();
    const user = authService.getUser(userId);
    return user ? userId : null;
  }

  return null;
}

/**
 * Verify request signature for sensitive operations
 * 
 * @param request - Next.js request object
 * @param secret - Shared secret for signature verification
 * @returns True if signature is valid
 */
export async function verifyRequestSignature(
  request: NextRequest,
  secret: string
): Promise<boolean> {
  const signature = request.headers.get('X-Signature');
  const timestamp = request.headers.get('X-Timestamp');

  if (!signature || !timestamp) {
    return false;
  }

  // Check timestamp is within 5 minutes
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (Math.abs(now - requestTime) > fiveMinutes) {
    return false;
  }

  // Verify signature
  try {
    const body = await request.text();
    const payload = `${timestamp}.${body}`;
    
    // In production, use crypto.subtle.sign with HMAC-SHA256
    // For now, simple comparison
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Middleware to require API authentication
 * 
 * @param requiredPermission - Optional permission required
 * @returns Middleware function
 */
export function requireApiAuth(requiredPermission?: Permission) {
  return (request: NextRequest): NextResponse | null => {
    // Try API key authentication first
    const apiKey = verifyApiKey(request);
    
    if (apiKey) {
      // Check permission if required
      if (requiredPermission && !apiKey.permissions.includes(requiredPermission)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: `API key does not have required permission: ${requiredPermission}`,
          },
          { status: 403 }
        );
      }
      return null; // Authentication successful
    }

    // Try JWT authentication
    const userId = verifyJWT(request);
    
    if (userId) {
      // Check permission if required
      if (requiredPermission) {
        const authService = getAuthService();
        const hasPermission = authService.checkPermission(userId, requiredPermission);
        
        if (!hasPermission) {
          return NextResponse.json(
            {
              error: 'Forbidden',
              message: `User does not have required permission: ${requiredPermission}`,
            },
            { status: 403 }
          );
        }
      }
      return null; // Authentication successful
    }

    // No valid authentication
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid API key or authentication token required',
      },
      { status: 401 }
    );
  };
}
