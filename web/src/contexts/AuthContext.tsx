'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '../services/auth/authService';
import { User, AuthContextType } from '../types/user';

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Context Provider Component
 * Manages authentication state and provides auth methods to child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in with Google
   */
  const signIn = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const user = await AuthService.signInWithGoogle();
      setUser(user);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      setUser(null);
    } catch (error: any) {
      setError(error.message || 'Failed to sign out');
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear the current error state
   */
  const clearError = (): void => {
    setError(null);
  };

  /**
   * Initialize authentication state and set up auth state listener
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = () => {
      // Set up authentication state change listener
      unsubscribe = AuthService.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
        setError(null);
      });
    };

    initializeAuth();

    // Cleanup function to unsubscribe from auth state changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Clear error when user changes
   */
  useEffect(() => {
    if (user) {
      setError(null);
    }
  }, [user]);

  // Context value object
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the authentication context
 * Throws an error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthProvider;