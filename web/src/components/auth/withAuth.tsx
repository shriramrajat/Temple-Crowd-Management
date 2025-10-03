'use client';

import React, { ComponentType } from 'react';
import { AuthGuard } from './AuthGuard';

interface WithAuthOptions {
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that wraps a component with authentication protection
 * @param WrappedComponent - The component to protect
 * @param options - Configuration options for the auth guard
 * @returns Protected component that requires authentication
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = '/login', fallback } = options;

  const AuthenticatedComponent: React.FC<P> = (props) => {
    return (
      <AuthGuard redirectTo={redirectTo} fallback={fallback}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthenticatedComponent;
}

export default withAuth;