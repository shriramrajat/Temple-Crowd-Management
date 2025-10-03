'use client';

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: Date;
  dismissible: boolean;
  retryable: boolean;
  retryAction?: () => Promise<any> | any;
  context?: Record<string, any>;
}

interface ErrorState {
  errors: AppError[];
  isRetrying: boolean;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_RETRYING'; payload: boolean }
  | { type: 'RETRY_ERROR'; payload: string };

interface ErrorContextType {
  state: ErrorState;
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  retryError: (id: string) => Promise<void>;
  showError: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>) => string;
  showWarning: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>) => string;
  showInfo: (message: string, options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>) => string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError: AppError = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      return {
        ...state,
        errors: [...state.errors, newError],
      };

    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };

    case 'SET_RETRYING':
      return {
        ...state,
        isRetrying: action.payload,
      };

    case 'RETRY_ERROR':
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload
            ? { ...error, retryable: false }
            : error
        ),
      };

    default:
      return state;
  }
};

const initialState: ErrorState = {
  errors: [],
  isRetrying: false,
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorContextProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>): string => {
    const errorWithDefaults = {
      ...error,
      type: error.type || ('error' as const),
      dismissible: error.dismissible !== undefined ? error.dismissible : true,
      retryable: error.retryable !== undefined ? error.retryable : false,
    };
    
    const id = Math.random().toString(36).substr(2, 9);
    dispatch({ type: 'ADD_ERROR', payload: errorWithDefaults });
    
    // Auto-dismiss non-critical errors after 5 seconds
    if (errorWithDefaults.dismissible && errorWithDefaults.type !== 'error') {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_ERROR', payload: id });
      }, 5000);
    }
    
    return id;
  }, []);

  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  const retryError = useCallback(async (id: string) => {
    const error = state.errors.find(e => e.id === id);
    if (!error || !error.retryAction) return;

    dispatch({ type: 'SET_RETRYING', payload: true });
    dispatch({ type: 'RETRY_ERROR', payload: id });

    try {
      await error.retryAction();
      // Remove error on successful retry
      removeError(id);
    } catch (retryError) {
      // Add new error for retry failure
      addError({
        message: `Retry failed: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`,
        type: 'error',
        dismissible: true,
        retryable: false,
      });
    } finally {
      dispatch({ type: 'SET_RETRYING', payload: false });
    }
  }, [state.errors, addError, removeError]);

  const showError = useCallback((
    message: string, 
    options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>
  ): string => {
    return addError({
      message,
      type: 'error',
      dismissible: true,
      retryable: false,
      ...options,
    });
  }, [addError]);

  const showWarning = useCallback((
    message: string, 
    options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>
  ): string => {
    return addError({
      message,
      type: 'warning',
      dismissible: true,
      retryable: false,
      ...options,
    });
  }, [addError]);

  const showInfo = useCallback((
    message: string, 
    options?: Partial<Omit<AppError, 'id' | 'timestamp' | 'message'>>
  ): string => {
    return addError({
      message,
      type: 'info',
      dismissible: true,
      retryable: false,
      ...options,
    });
  }, [addError]);

  const value: ErrorContextType = {
    state,
    addError,
    removeError,
    clearErrors,
    retryError,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useErrorContext = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorContextProvider');
  }
  return context;
};