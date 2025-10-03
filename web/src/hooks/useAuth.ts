'use client';

import { useAuthContext } from '../contexts/AuthContext';
import { User, AuthContextType } from '../types/user';

/**
 * Authentication Hook Interface
 * Extends the base AuthContextType with additional helper functions
 */
export interface UseAuthReturn extends AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasError: boolean;
  clearError: () => void;
  getUserDisplayName: () => string;
  getUserEmail: () => string;
  getUserPhotoURL: () => string | undefined;
}

/**
 * Custom hook for authentication operations
 * Provides access to auth context and additional helper functions
 */
export const useAuth = (): UseAuthReturn => {
  const authContext = useAuthContext();
  const { user, loading, error, signIn, signOut, clearError: contextClearError } = authContext;

  /**
   * Check if user is currently authenticated
   */
  const isAuthenticated = !!user;

  /**
   * Check if authentication is in loading state
   */
  const isLoading = loading;

  /**
   * Check if there's an authentication error
   */
  const hasError = !!error;

  /**
   * Clear the current error state
   */
  const clearError = (): void => {
    contextClearError();
  };

  /**
   * Get user's display name with fallback
   */
  const getUserDisplayName = (): string => {
    if (!user) return '';
    return user.displayName || user.email || 'User';
  };

  /**
   * Get user's email with fallback
   */
  const getUserEmail = (): string => {
    if (!user) return '';
    return user.email || '';
  };

  /**
   * Get user's photo URL
   */
  const getUserPhotoURL = (): string | undefined => {
    if (!user) return undefined;
    return user.photoURL;
  };

  return {
    // Base auth context properties
    user,
    loading,
    error,
    signIn,
    signOut,
    
    // Additional helper properties and functions
    isAuthenticated,
    isLoading,
    hasError,
    clearError,
    getUserDisplayName,
    getUserEmail,
    getUserPhotoURL,
  };
};

/**
 * Hook for checking authentication status only
 * Useful for components that only need to know if user is authenticated
 */
export const useAuthStatus = (): {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
} => {
  const { user, loading } = useAuthContext();
  
  return {
    isAuthenticated: !!user,
    isLoading: loading,
    user,
  };
};

/**
 * Hook for authentication actions only
 * Useful for components that only need sign in/out functionality
 */
export const useAuthActions = (): {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
} => {
  const { signIn, signOut, loading, error } = useAuthContext();
  
  return {
    signIn,
    signOut,
    isLoading: loading,
    error,
  };
};

export default useAuth;