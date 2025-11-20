'use client';

/**
 * Protected Route Component
 * 
 * Wraps pages that require specific permissions and redirects to access denied page
 * if user lacks required permission.
 * Task 15.1: Create ProtectedRoute component for permission-based access control
 */

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Permission, AdminRole } from '@/lib/crowd-risk/types';
import { getAuthService } from '@/lib/crowd-risk/auth-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: Permission;
  requiredRole?: AdminRole;
  userId: string | null;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Checks if user has required permission or role before rendering children.
 * Shows loading state while checking permissions.
 * Shows access denied message or redirects if user lacks permission.
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  userId,
  fallbackPath = '/admin',
  showAccessDenied = true,
}: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const authService = getAuthService();

  useEffect(() => {
    const checkAccess = () => {
      // If no userId, deny access
      if (!userId) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }

      let access = true;

      // Check required permission
      if (requiredPermission) {
        access = access && authService.checkPermission(userId, requiredPermission);
      }

      // Check required role
      if (requiredRole) {
        access = access && authService.hasRole(userId, requiredRole);
      }

      setHasAccess(access);
      setIsChecking(false);

      // Redirect if no access and showAccessDenied is false
      if (!access && !showAccessDenied) {
        router.push(fallbackPath);
      }
    };

    checkAccess();
  }, [userId, requiredPermission, requiredRole, authService, router, fallbackPath, showAccessDenied]);

  // Loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Access granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // Access denied
  if (showAccessDenied) {
    const user = userId ? authService.getUser(userId) : null;
    const userRole = user?.role;

    return (
      <div className="container max-w-2xl mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle className="text-2xl">Access Denied</CardTitle>
                <CardDescription>
                  You don't have permission to access this page
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Insufficient Permissions</AlertTitle>
              <AlertDescription className="space-y-2">
                {!userId && (
                  <p>You must be logged in to access this page.</p>
                )}
                {userId && requiredPermission && (
                  <p>
                    This page requires the <strong>{requiredPermission}</strong> permission.
                  </p>
                )}
                {userId && requiredRole && (
                  <p>
                    This page requires the <strong>{requiredRole}</strong> role.
                  </p>
                )}
                {userRole && (
                  <p className="text-sm mt-2">
                    Your current role: <strong>{userRole}</strong>
                  </p>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If you believe you should have access to this page, please contact your system administrator.
              </p>
              <p className="text-sm text-muted-foreground">
                Contact: <strong>super@admin.com</strong>
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push(fallbackPath)}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If showAccessDenied is false and we reach here, return null (redirect should have happened)
  return null;
}

/**
 * Hook to check if user has permission
 * Useful for conditional rendering within components
 */
export function useHasPermission(userId: string | null, permission: Permission): boolean {
  const [hasPermission, setHasPermission] = useState(false);
  const authService = getAuthService();

  useEffect(() => {
    if (!userId) {
      setHasPermission(false);
      return;
    }

    const result = authService.checkPermission(userId, permission);
    setHasPermission(result);
  }, [userId, permission, authService]);

  return hasPermission;
}

/**
 * Hook to check if user has role
 * Useful for conditional rendering within components
 */
export function useHasRole(userId: string | null, role: AdminRole): boolean {
  const [hasRole, setHasRole] = useState(false);
  const authService = getAuthService();

  useEffect(() => {
    if (!userId) {
      setHasRole(false);
      return;
    }

    const result = authService.hasRole(userId, role);
    setHasRole(result);
  }, [userId, role, authService]);

  return hasRole;
}
