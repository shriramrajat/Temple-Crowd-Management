import { firestoreService } from '../firestoreService'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'

// Mock Firestore functions
jest.mock('firebase/firestore')
const mockGetFirestore = getFirestore as jest.MockedFunction<typeof getFirestore>
const mockCollection = collection as jest.MockedFunction<typeof collection>
const mockDoc = doc as jest.MockedFunction<typeof doc>
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>
const mockQuery = query as jest.MockedFunction<typeof query>
const mockWhere = where as jest.MockedFunction<typeof where>
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>
const mockLimit = limit as jest.MockedFunction<typeof limit>

describe('FirestoreService', () => {
  const mockDb = {}
  const mockCollectionRef = {}
  const mockDocRef = { id: 'test-doc-id' }
  const mockDocSnapshot = {
    exists: () => true,
    data: () => ({ name: 'Test Document', value: 123 }),
    id: 'test-doc-id'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetFirestore.mockReturnValue(mockDb as any)
    mockCollection.mockReturnValue(mockCollectionRef as any)
    mockDoc.mockReturnValue(mockDocRef as any)
  })

  describe('createDocument', () => {
    it('successfully creates a document', async () => {
      const testData = { name: 'Test', value: 123 }
      mockAddDoc.mockResolvedValue(mockDocRef as any)

      const result = await firestoreService.createDocument('users', testData)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users')
      expect(mockAddDoc).toHaveBeenCalledWith(mockCollectionRef, testData)
      expect(result).toBe('test-doc-id')
    })

    it('handles creation errors', async () => {
      const error = new Error('Permission denied')
      mockAddDoc.mockRejectedValue(error)

      await expect(firestoreService.createDocument('users', {}))
        .rejects.toThrow('Permission denied')
    })
  })

  describe('getDocument', () => {
    it('successfully retrieves a document', async () => {
      mockGetDoc.mockResolvedValue(mockDocSnapshot as any)

      const result = await firestoreService.getDocument('users', 'test-id')

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', 'test-id')
      expect(mockGetDoc).toHaveBeenCalledWith(mockDocRef)
      expect(result).toEqual({
        id: 'test-doc-id',
        name: 'Test Document',
        value: 123
      })
    })

    it('returns null for non-existent document', async () => {
      const nonExistentDoc = {
        exists: () => false,
        data: () => undefined,
        id: 'non-existent'
      }
      mockGetDoc.mockResolvedValue(nonExistentDoc as any)

      const result = await firestoreService.getDocument('users', 'non-existent')

      expect(result).toBeNull()
    })

    it('handles retrieval errors', async () => {
      const error = new Error('Network error')
      mockGetDoc.mockRejectedValue(error)

      await expect(firestoreService.getDocument('users', 'test-id'))
        .rejects.toThrow('Network error')
    })
  })

  describe('updateDocument', () => {
    it('successfully updates a document', async () => {
      const updateData = { name: 'Updated Name' }
      mockUpdateDoc.mockResolvedValue(undefined)

      await firestoreService.updateDocument('users', 'test-id', updateData)

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', 'test-id')
      expect(mockUpdateDoc).toHaveBeenCalledWith(mockDocRef, updateData)
    })

    it('handles update errors', async () => {
      const error = new Error('Document not found')
      mockUpdateDoc.mockRejectedValue(error)

      await expect(firestoreService.updateDocument('users', 'test-id', {}))
        .rejects.toThrow('Document not found')
    })
  })

  describe('deleteDocument', () => {
    it('successfully deletes a document', async () => {
      mockDeleteDoc.mockResolvedValue(undefined)

      await firestoreService.deleteDocument('users', 'test-id')

      expect(mockDoc).toHaveBeenCalledWith(mockDb, 'users', 'test-id')
      expect(mockDeleteDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('handles deletion errors', async () => {
      const error = new Error('Permission denied')
      mockDeleteDoc.mockRejectedValue(error)

      await expect(firestoreService.deleteDocument('users', 'test-id'))
        .rejects.toThrow('Permission denied')
    })
  })

  describe('subscribeToCollection', () => {
    it('sets up collection subscription', () => {
      const callback = jest.fn()
      const unsubscribe = jest.fn()
      const mockQuerySnapshot = {
        docs: [mockDocSnapshot]
      }

      mockOnSnapshot.mockImplementation((query, cb) => {
        cb(mockQuerySnapshot as any)
        return unsubscribe
      })

      const result = firestoreService.subscribeToCollection('users', callback)

      expect(mockCollection).toHaveBeenCalledWith(mockDb, 'users')
      expect(mockOnSnapshot).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith([{
        id: 'test-doc-id',
        name: 'Test Document',
        value: 123
      }])
      expect(result).toBe(unsubscribe)
    })

    it('handles subscription errors', () => {
      const callback = jest.fn()
      const error = new Error('Subscription failed')

      mockOnSnapshot.mockImplementation((query, cb, errorCb) => {
        errorCb(error)
        return jest.fn()
      })

      expect(() => {
        firestoreService.subscribeToCollection('users', callback)
      }).toThrow('Subscription failed')
    })
  })

  describe('queryCollection', () => {
    it('creates query with where clause', async () => {
      const mockQueryRef = {}
      const mockQuerySnapshot = {
        docs: [mockDocSnapshot]
      }

      mockWhere.mockReturnValue({} as any)
      mockQuery.mockReturnValue(mockQueryRef as any)
      mockGetDoc.mockResolvedValue(mockQuerySnapshot as any)

      const result = await firestoreService.queryCollection('users', [
        { field: 'status', operator: '==', value: 'active' }
      ])

      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'active')
      expect(mockQuery).toHaveBeenCalled()
    })

    it('creates query with orderBy clause', async () => {
      const mockQueryRef = {}
      const mockQuerySnapshot = {
        docs: [mockDocSnapshot]
      }

      mockOrderBy.mockReturnValue({} as any)
      mockQuery.mockReturnValue(mockQueryRef as any)
      mockGetDoc.mockResolvedValue(mockQuerySnapshot as any)

      await firestoreService.queryCollection('users', [], [
        { field: 'createdAt', direction: 'desc' }
      ])

      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc')
    })

    it('creates query with limit', async () => {
      const mockQueryRef = {}
      const mockQuerySnapshot = {
        docs: [mockDocSnapshot]
      }

      mockLimit.mockReturnValue({} as any)
      mockQuery.mockReturnValue(mockQueryRef as any)
      mockGetDoc.mockResolvedValue(mockQuerySnapshot as any)

      await firestoreService.queryCollection('users', [], [], 10)

      expect(mockLimit).toHaveBeenCalledWith(10)
    })
  })
})