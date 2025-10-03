import { useState, useEffect, useCallback } from 'react';
import { User } from '../types/user';

/**
 * Lazy-loaded authentication hook that dynamically imports Firebase auth
 * This reduces the initial bundle size by loading auth services only when needed
 */
export const useLazyAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authService, setAuthService] = useState<any>(null);

  // Dynamically load auth service
  const loadAuthService = useCallback(async () => {
    try {
      const { getAuthService } = await import('../services/firebase/dynamicImports');
      const service = await getAuthService();
      setAuthService(service);
      return service;
    } catch (err) {
      console.error('Failed to load auth service:', err);
      setError('Failed to load authentication service');
      return null;
    }
  }, []);

  // Initialize auth service and set up listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      const service = await loadAuthService();
      if (service) {
        // Set up auth state listener
        unsubscribe = service.onAuthStateChanged((user: User | null) => {
          setUser(user);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadAuthService]);

  // Sign in function with lazy loading
  const signIn = useCallback(async () => {
    if (!authService) {
      const service = await loadAuthService();
      if (!service) return;
      setAuthService(service);
    }

    try {
      setLoading(true);
      setError(null);
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }, [authService, loadAuthService]);

  // Sign out function with lazy loading
  const signOut = useCallback(async () => {
    if (!authService) {
      const service = await loadAuthService();
      if (!service) return;
      setAuthService(service);
    }

    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
    } finally {
      setLoading(false);
    }
  }, [authService, loadAuthService]);

  return {
    user,
    loading,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};