import React from 'react';
import { Button, type ButtonProps } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export interface SignOutButtonProps extends Omit<ButtonProps, 'onClick' | 'loading' | 'onError' | 'children'> {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  confirmBeforeSignOut?: boolean;
  confirmMessage?: string;
  children?: React.ReactNode;
}

export const SignOutButton: React.FC<SignOutButtonProps> = ({
  onSuccess,
  onError,
  confirmBeforeSignOut = false,
  confirmMessage = 'Are you sure you want to sign out?',
  children,
  ...buttonProps
}) => {
  const { signOut, loading, user } = useAuth();

  const handleSignOut = async () => {
    // Show confirmation dialog if requested
    if (confirmBeforeSignOut) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        return;
      }
    }

    try {
      await signOut();
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      onError?.(errorMessage);
    }
  };

  // Don't render if user is not signed in
  if (!user) {
    return null;
  }

  return (
    <Button
      onClick={handleSignOut}
      loading={loading}
      disabled={loading}
      variant="outline"
      {...buttonProps}
    >
      <div className="flex items-center space-x-2">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        <span>{children || 'Sign Out'}</span>
      </div>
    </Button>
  );
};