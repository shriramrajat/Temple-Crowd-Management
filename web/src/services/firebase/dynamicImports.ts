/**
 * Dynamic imports for Firebase services to reduce initial bundle size
 * These imports are loaded only when needed
 */

// Auth service dynamic import
export const getAuthService = async () => {
  const { AuthService } = await import('../auth/authService');
  return AuthService;
};

// Firestore service dynamic import
export const getFirestoreService = async () => {
  const { FirestoreService } = await import('../firestore/firestoreService');
  return FirestoreService;
};

// Firebase config dynamic import
export const getFirebaseConfig = async () => {
  const config = await import('./config');
  return config;
};

// Specific Firebase auth functions dynamic imports
export const getFirebaseAuth = async () => {
  const [
    { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged },
    { auth }
  ] = await Promise.all([
    import('firebase/auth'),
    import('./config')
  ]);
  
  return {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    auth
  };
};

// Specific Firebase firestore functions dynamic imports
export const getFirebaseFirestore = async () => {
  const [
    {
      collection,
      doc,
      addDoc,
      getDoc,
      getDocs,
      updateDoc,
      deleteDoc,
      query,
      orderBy,
      limit,
      where,
      onSnapshot,
      serverTimestamp,
    },
    { db }
  ] = await Promise.all([
    import('firebase/firestore'),
    import('./config')
  ]);
  
  return {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    limit,
    where,
    onSnapshot,
    serverTimestamp,
    db
  };
};