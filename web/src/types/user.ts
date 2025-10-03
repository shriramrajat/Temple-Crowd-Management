// User interface based on Firebase User object
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication context type
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

// Authentication error types
export interface AuthError {
  code: string;
  message: string;
}

// Firebase User to App User conversion type
export type FirebaseUserData = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
};