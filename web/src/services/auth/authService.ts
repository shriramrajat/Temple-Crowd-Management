import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { User, AuthError, FirebaseUserData } from '../../types/user';

// Google Auth Provider instance
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Convert Firebase User to our App User format
 */
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: firebaseUser.metadata.creationTime 
      ? new Date(firebaseUser.metadata.creationTime) 
      : new Date(),
    lastLoginAt: firebaseUser.metadata.lastSignInTime 
      ? new Date(firebaseUser.metadata.lastSignInTime) 
      : new Date(),
  };
};

/**
 * Convert Firebase Auth errors to user-friendly messages
 */
const getAuthErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    default:
      return 'An error occurred during sign-in. Please try again.';
  }
};

/**
 * Authentication Service Class
 */
export class AuthService {
  /**
   * Sign in with Google using popup
   */
  static async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = convertFirebaseUser(result.user);
      return user;
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code || 'unknown',
        message: getAuthErrorMessage(error),
      };
      throw authError;
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code || 'unknown',
        message: 'Failed to sign out. Please try again.',
      };
      throw authError;
    }
  }

  /**
   * Get the current authenticated user
   */
  static getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? convertFirebaseUser(firebaseUser) : null;
  }

  /**
   * Listen to authentication state changes
   */
  static onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const user = firebaseUser ? convertFirebaseUser(firebaseUser) : null;
      callback(user);
    });
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Get the current user's ID token
   */
  static async getIdToken(): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }
}

export default AuthService;