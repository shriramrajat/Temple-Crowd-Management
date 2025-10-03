import {
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
  Timestamp,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  FirestoreError,
  QueryOptions,
  SubscriptionCallback,
  UnsubscribeFunction,
  IFirestoreService,
} from '../../types/firestore';

/**
 * Convert Firestore Timestamp to Date
 */
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date();
};

/**
 * Convert Firestore document data to app format
 */
const convertDocumentData = <T>(id: string, data: DocumentData): T => {
  const converted = { ...data };
  
  // Convert Firestore timestamps to Date objects
  if (converted.createdAt) {
    converted.createdAt = convertTimestamp(converted.createdAt);
  }
  if (converted.updatedAt) {
    converted.updatedAt = convertTimestamp(converted.updatedAt);
  }
  
  return {
    id,
    ...converted,
  } as T;
};

/**
 * Convert Firestore errors to user-friendly messages
 */
const getFirestoreErrorMessage = (error: any): string => {
  switch (error.code) {
    case 'permission-denied':
      return 'You do not have permission to perform this action.';
    case 'not-found':
      return 'The requested document was not found.';
    case 'already-exists':
      return 'A document with this ID already exists.';
    case 'resource-exhausted':
      return 'Quota exceeded. Please try again later.';
    case 'failed-precondition':
      return 'The operation failed due to a precondition.';
    case 'aborted':
      return 'The operation was aborted due to a conflict.';
    case 'out-of-range':
      return 'The operation was attempted past the valid range.';
    case 'unimplemented':
      return 'This operation is not implemented or supported.';
    case 'internal':
      return 'An internal error occurred. Please try again.';
    case 'unavailable':
      return 'The service is currently unavailable. Please try again.';
    case 'data-loss':
      return 'Unrecoverable data loss or corruption occurred.';
    case 'unauthenticated':
      return 'You must be authenticated to perform this action.';
    default:
      return 'An error occurred while accessing the database.';
  }
};

/**
 * Build Firestore query constraints from options
 */
const buildQueryConstraints = (options?: QueryOptions): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [];
  
  if (!options) return constraints;
  
  // Add where clauses
  if (options.where) {
    options.where.forEach((whereClause) => {
      constraints.push(where(whereClause.field, whereClause.operator, whereClause.value));
    });
  }
  
  // Add order by
  if (options.orderBy) {
    constraints.push(orderBy(options.orderBy.field, options.orderBy.direction));
  }
  
  // Add limit
  if (options.limit) {
    constraints.push(limit(options.limit));
  }
  
  return constraints;
};

/**
 * Firestore Service Implementation
 */
export class FirestoreService implements IFirestoreService {
  /**
   * Create a new document in a collection
   */
  async createDocument<T>(
    collectionName: string, 
    data: Omit<T, 'id'>
  ): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument<T>(
    collectionName: string, 
    id: string
  ): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertDocumentData<T>(docSnap.id, docSnap.data());
      }
      
      return null;
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T>(
    collectionName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updateData);
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Get all documents from a collection with optional query options
   */
  async getCollection<T>(
    collectionName: string, 
    options?: QueryOptions
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = buildQueryConstraints(options);
      const q = query(collectionRef, ...constraints);
      
      const querySnapshot = await getDocs(q);
      const documents: T[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push(convertDocumentData<T>(doc.id, doc.data()));
      });
      
      return documents;
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Subscribe to real-time updates for a collection
   */
  subscribeToCollection<T>(
    collectionName: string,
    callback: SubscriptionCallback<T>,
    options?: QueryOptions
  ): UnsubscribeFunction {
    try {
      const collectionRef = collection(db, collectionName);
      const constraints = buildQueryConstraints(options);
      const q = query(collectionRef, ...constraints);
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const documents: T[] = [];
          querySnapshot.forEach((doc) => {
            documents.push(convertDocumentData<T>(doc.id, doc.data()));
          });
          callback(documents);
        },
        (error) => {
          console.error('Firestore subscription error:', error);
          const firestoreError: FirestoreError = {
            code: error.code || 'unknown',
            message: getFirestoreErrorMessage(error),
          };
          throw firestoreError;
        }
      );
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }

  /**
   * Subscribe to real-time updates for a single document
   */
  subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: (data: T | null) => void
  ): UnsubscribeFunction {
    try {
      const docRef = doc(db, collectionName, id);
      
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = convertDocumentData<T>(docSnap.id, docSnap.data());
            callback(data);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Firestore document subscription error:', error);
          const firestoreError: FirestoreError = {
            code: error.code || 'unknown',
            message: getFirestoreErrorMessage(error),
          };
          throw firestoreError;
        }
      );
    } catch (error: any) {
      const firestoreError: FirestoreError = {
        code: error.code || 'unknown',
        message: getFirestoreErrorMessage(error),
      };
      throw firestoreError;
    }
  }
}

// Create a singleton instance
const firestoreServiceInstance = new FirestoreService();

// Export static methods for convenience
export const firestoreService = {
  createDocument: <T>(collectionName: string, data: Omit<T, 'id'>) => 
    firestoreServiceInstance.createDocument<T>(collectionName, data),
  
  getDocument: <T>(collectionName: string, id: string) => 
    firestoreServiceInstance.getDocument<T>(collectionName, id),
  
  updateDocument: <T>(collectionName: string, id: string, data: Partial<T>) => 
    firestoreServiceInstance.updateDocument<T>(collectionName, id, data),
  
  deleteDocument: (collectionName: string, id: string) => 
    firestoreServiceInstance.deleteDocument(collectionName, id),
  
  getCollection: <T>(collectionName: string, options?: QueryOptions) => 
    firestoreServiceInstance.getCollection<T>(collectionName, options),
  
  subscribeToCollection: <T>(
    collectionName: string, 
    callback: SubscriptionCallback<T>, 
    options?: QueryOptions
  ) => firestoreServiceInstance.subscribeToCollection<T>(collectionName, callback, options),
  
  subscribeToDocument: <T>(
    collectionName: string, 
    id: string, 
    callback: (data: T | null) => void
  ) => firestoreServiceInstance.subscribeToDocument<T>(collectionName, id, callback),
};

export default FirestoreService;