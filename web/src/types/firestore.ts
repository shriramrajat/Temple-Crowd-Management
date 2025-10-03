// Generic document interface
export interface FirestoreDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore error types
export interface FirestoreError {
  code: string;
  message: string;
}

// Query options for Firestore operations
export interface QueryOptions {
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  where?: {
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
    value: any;
  }[];
}

// Subscription callback type
export type SubscriptionCallback<T> = (data: T[]) => void;

// Unsubscribe function type
export type UnsubscribeFunction = () => void;

// Firestore service interface
export interface IFirestoreService {
  // Document operations
  createDocument<T>(collection: string, data: Omit<T, 'id'>): Promise<string>;
  getDocument<T>(collection: string, id: string): Promise<T | null>;
  updateDocument<T>(collection: string, id: string, data: Partial<T>): Promise<void>;
  deleteDocument(collection: string, id: string): Promise<void>;
  
  // Collection operations
  getCollection<T>(collection: string, options?: QueryOptions): Promise<T[]>;
  subscribeToCollection<T>(
    collection: string, 
    callback: SubscriptionCallback<T>, 
    options?: QueryOptions
  ): UnsubscribeFunction;
  
  // Document subscription
  subscribeToDocument<T>(
    collection: string, 
    id: string, 
    callback: (data: T | null) => void
  ): UnsubscribeFunction;
}