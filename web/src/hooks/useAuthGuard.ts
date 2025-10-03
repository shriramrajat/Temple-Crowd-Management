'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

interface UseAuthGuardOptions {
  redirectTo?: string;
  enabled?: boolean;
}

/**
 * Hook for protecting routes with authentication
 * Automatically redirects unauthenticated users to login page
 * 
 * @param options - Configuration options
 * @returns Authentication status and loading state
 */
export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { redirectTo = '/login', enabled = true } = options;
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if guard is enabled, not loading, and user is not authenticated
    if (enabled && !isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [enabled, isAuthenticated, isLoading, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isProtected: enabled,
  };
};

/**
 * Hook that requires authentication and throws if not authenticated
 * Use this in components that should only render for authenticated users
 * 
 * @param redirectTo - Where to redirect if not authenticated
 * @returns User data (guaranteed to be non-null)
 */
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { isAuthenticated, isLoading, user } = useAuthGuard({ redirectTo });

  if (isLoading) {
    return { user: null, isLoading: true };
  }

  if (!isAuthenticated || !user) {
    return { user: null, isLoading: false };
  }

  return { user, isLoading: false };
};

export default useAuthGuard;