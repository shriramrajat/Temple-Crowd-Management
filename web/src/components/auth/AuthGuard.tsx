'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * AuthGuard Component
 * Protects routes by checking authentication status and redirecting unauthenticated users
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = '/login',
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {fallback || (
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        )}
      </div>
    );
  }

  // If not authenticated, show nothing (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default AuthGuard;