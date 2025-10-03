'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LoginButton } from '../../components/auth/LoginButton';
import { Card } from '../../components/ui/Card';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { getReturnUrl } from '../../lib/auth-utils';

/**
 * Login Page Content Component
 * Handles user authentication and redirects to intended destination
 */
function LoginPageContent() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect authenticated users to dashboard or return URL
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const returnUrl = getReturnUrl(searchParams, '/dashboard');
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, searchParams]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Don't render login form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <ErrorMessage 
                message={error} 
                className="mb-4"
              />
            )}

            {/* Login Button */}
            <div className="flex flex-col items-center space-y-4">
              <LoginButton />
              
              <p className="text-xs text-gray-500 text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Return URL Info */}
            {searchParams.get('returnUrl') && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  You'll be redirected to your requested page after signing in.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            New to our platform?{' '}
            <span className="font-medium text-blue-600">
              Sign in with Google to get started
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Login Page with Suspense boundary
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}