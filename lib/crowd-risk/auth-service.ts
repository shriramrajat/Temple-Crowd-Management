/**
 * Authorization Service
 * 
 * Manages role-based access control for crowd risk features.
 * Task 15.1: Implement authorization service with role and permission checking
 */

import { AdminRole, Permission, RolePermissions } from './types';

/**
 * User with role information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

/**
 * Authorization Service
 * 
 * Provides role-based access control functionality including:
 * - Permission checking
 * - Role retrieval
 * - User management
 */
export class AuthService {
  private users: Map<string, User> = new Map();

  constructor() {
    // Initialize with default test users
    this.initializeDefaultUsers();
  }

  /**
   * Initialize default admin users for testing
   */
  private initializeDefaultUsers(): void {
    const defaultUsers: User[] = [
      {
        id: 'super_admin',
        name: 'Super Administrator',
        email: 'super@admin.com',
        role: AdminRole.SUPER_ADMIN,
      },
      {
        id: 'safety_admin',
        name: 'Safety Administrator',
        email: 'safety@admin.com',
        role: AdminRole.SAFETY_ADMIN,
      },
      {
        id: 'monitor_only',
        name: 'Monitor User',
        email: 'monitor@admin.com',
        role: AdminRole.MONITOR_ONLY,
      },
    ];

    defaultUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  /**
   * Check if a user has a specific permission
   * 
   * @param userId - User ID to check
   * @param permission - Permission to check
   * @returns True if user has the permission
   */
  checkPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    
    if (!user) {
      console.warn(`User not found: ${userId}`);
      return false;
    }

    const rolePermissions = RolePermissions[user.role];
    return rolePermissions.includes(permission);
  }

  /**
   * Get user's role
   * 
   * @param userId - User ID
   * @returns User's role or null if user not found
   */
  getUserRole(userId: string): AdminRole | null {
    const user = this.users.get(userId);
    return user?.role || null;
  }

  /**
   * Check if user has a specific role
   * 
   * @param userId - User ID to check
   * @param role - Role to check
   * @returns True if user has the role
   */
  hasRole(userId: string, role: AdminRole): boolean {
    const userRole = this.getUserRole(userId);
    return userRole === role;
  }

  /**
   * Get user by ID
   * 
   * @param userId - User ID
   * @returns User object or null if not found
   */
  getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Get all users
   * 
   * @returns Array of all users
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  /**
   * Add or update a user
   * 
   * @param user - User to add or update
   */
  setUser(user: User): void {
    this.users.set(user.id, user);
  }

  /**
   * Remove a user
   * 
   * @param userId - User ID to remove
   * @returns True if user was removed
   */
  removeUser(userId: string): boolean {
    return this.users.delete(userId);
  }

  /**
   * Get all permissions for a user
   * 
   * @param userId - User ID
   * @returns Array of permissions or empty array if user not found
   */
  getUserPermissions(userId: string): Permission[] {
    const user = this.users.get(userId);
    
    if (!user) {
      return [];
    }

    return RolePermissions[user.role];
  }

  /**
   * Check if user has any of the specified permissions
   * 
   * @param userId - User ID
   * @param permissions - Array of permissions to check
   * @returns True if user has at least one of the permissions
   */
  hasAnyPermission(userId: string, permissions: Permission[]): boolean {
    return permissions.some(permission => this.checkPermission(userId, permission));
  }

  /**
   * Check if user has all of the specified permissions
   * 
   * @param userId - User ID
   * @param permissions - Array of permissions to check
   * @returns True if user has all of the permissions
   */
  hasAllPermissions(userId: string, permissions: Permission[]): boolean {
    return permissions.every(permission => this.checkPermission(userId, permission));
  }

  /**
   * Clear all users (for testing)
   */
  clearAll(): void {
    this.users.clear();
  }

  /**
   * Reset to default users (for testing)
   */
  reset(): void {
    this.clearAll();
    this.initializeDefaultUsers();
  }
}

/**
 * Singleton instance of AuthService
 */
let authServiceInstance: AuthService | null = null;

/**
 * Get singleton instance of AuthService
 * 
 * @returns AuthService instance
 */
export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

/**
 * Reset singleton instance (for testing)
 */
export function resetAuthService(): void {
  authServiceInstance = null;
}
