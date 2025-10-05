/**
 * Firestore Rules Validation Script
 * 
 * This script provides utilities to validate and test Firestore security rules
 * using the Firebase emulator.
 */

import { 
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const PROJECT_ID = 'darshan-booking-test';

let testEnv: RulesTestEnvironment;

/**
 * Initialize the test environment
 */
async function setupTestEnvironment(): Promise<void> {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
    },
  });
}

/**
 * Clean up test environment
 */
async function teardownTestEnvironment(): Promise<void> {
  await testEnv.cleanup();
}

/**
 * Test booking collection security rules
 */
async function testBookingRules(): Promise<void> {
  console.log('Testing booking collection rules...');
  
  const authenticatedContext = testEnv.authenticatedContext('user123');
  const unauthenticatedContext = testEnv.unauthenticatedContext();
  const otherUserContext = testEnv.authenticatedContext('user456');
  
  const bookingData = {
    userId: 'user123',
    slotTime: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Tomorrow
    status: 'confirmed',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  // Test: Unauthenticated users cannot create bookings
  await assertFails(
    setDoc(doc(unauthenticatedContext.firestore(), 'bookings', 'booking1'), bookingData)
  );
  console.log('✓ Unauthenticated users cannot create bookings');
  
  // Test: Authenticated users can create their own bookings
  await assertSucceeds(
    setDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking1'), bookingData)
  );
  console.log('✓ Authenticated users can create their own bookings');
  
  // Test: Users cannot create bookings for other users
  const otherUserBookingData = { ...bookingData, userId: 'user456' };
  await assertFails(
    setDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking2'), otherUserBookingData)
  );
  console.log('✓ Users cannot create bookings for other users');
  
  // Test: Users can read their own bookings
  await assertSucceeds(
    getDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking1'))
  );
  console.log('✓ Users can read their own bookings');
  
  // Test: Users cannot read other users' bookings
  await assertFails(
    getDoc(doc(otherUserContext.firestore(), 'bookings', 'booking1'))
  );
  console.log('✓ Users cannot read other users\' bookings');
  
  // Test: Users can cancel their own bookings
  await assertSucceeds(
    updateDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking1'), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    })
  );
  console.log('✓ Users can cancel their own bookings');
  
  // Test: Users cannot delete bookings
  await assertFails(
    deleteDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking1'))
  );
  console.log('✓ Users cannot delete bookings');
  
  // Test: Cannot create bookings in the past
  const pastBookingData = {
    ...bookingData,
    slotTime: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Yesterday
  };
  await assertFails(
    setDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking3'), pastBookingData)
  );
  console.log('✓ Cannot create bookings in the past');
  
  // Test: Cannot create bookings too far in advance (more than 30 days)
  const farFutureBookingData = {
    ...bookingData,
    slotTime: Timestamp.fromDate(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)) // 35 days from now
  };
  await assertFails(
    setDoc(doc(authenticatedContext.firestore(), 'bookings', 'booking4'), farFutureBookingData)
  );
  console.log('✓ Cannot create bookings too far in advance');
}

/**
 * Test time slots collection security rules
 */
async function testTimeSlotRules(): Promise<void> {
  console.log('Testing time slots collection rules...');
  
  const authenticatedContext = testEnv.authenticatedContext('user123');
  const unauthenticatedContext = testEnv.unauthenticatedContext();
  
  const timeSlotData = {
    date: Timestamp.fromDate(new Date()),
    time: '10:00',
    capacity: 50,
    booked: 0,
    available: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  // Test: Unauthenticated users cannot read time slots
  await assertFails(
    getDoc(doc(unauthenticatedContext.firestore(), 'timeSlots', 'slot1'))
  );
  console.log('✓ Unauthenticated users cannot read time slots');
  
  // Test: Authenticated users can create time slots (for testing purposes)
  await assertSucceeds(
    setDoc(doc(authenticatedContext.firestore(), 'timeSlots', 'slot1'), timeSlotData)
  );
  console.log('✓ Authenticated users can create time slots');
  
  // Test: Authenticated users can read time slots
  await assertSucceeds(
    getDoc(doc(authenticatedContext.firestore(), 'timeSlots', 'slot1'))
  );
  console.log('✓ Authenticated users can read time slots');
  
  // Test: Can update booked count and availability
  await assertSucceeds(
    updateDoc(doc(authenticatedContext.firestore(), 'timeSlots', 'slot1'), {
      booked: 1,
      available: true,
      updatedAt: serverTimestamp()
    })
  );
  console.log('✓ Can update booked count and availability');
  
  // Test: Cannot exceed capacity
  await assertFails(
    updateDoc(doc(authenticatedContext.firestore(), 'timeSlots', 'slot1'), {
      booked: 51, // Exceeds capacity of 50
      available: false,
      updatedAt: serverTimestamp()
    })
  );
  console.log('✓ Cannot exceed capacity when updating booked count');
  
  // Test: Cannot delete time slots
  await assertFails(
    deleteDoc(doc(authenticatedContext.firestore(), 'timeSlots', 'slot1'))
  );
  console.log('✓ Cannot delete time slots');
}

/**
 * Test query rules
 */
async function testQueryRules(): Promise<void> {
  console.log('Testing query rules...');
  
  const authenticatedContext = testEnv.authenticatedContext('user123');
  const unauthenticatedContext = testEnv.unauthenticatedContext();
  
  // Test: Authenticated users can query time slots
  await assertSucceeds(
    getDocs(collection(authenticatedContext.firestore(), 'timeSlots'))
  );
  console.log('✓ Authenticated users can query time slots');
  
  // Test: Unauthenticated users cannot query time slots
  await assertFails(
    getDocs(collection(unauthenticatedContext.firestore(), 'timeSlots'))
  );
  console.log('✓ Unauthenticated users cannot query time slots');
  
  // Test: Users can query their own bookings
  await assertSucceeds(
    getDocs(query(
      collection(authenticatedContext.firestore(), 'bookings'),
      where('userId', '==', 'user123')
    ))
  );
  console.log('✓ Users can query their own bookings');
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  try {
    console.log('Starting Firestore rules validation...');
    
    await setupTestEnvironment();
    
    await testBookingRules();
    await testTimeSlotRules();
    await testQueryRules();
    
    console.log('\n✅ All Firestore rules tests passed!');
  } catch (error) {
    console.error('\n❌ Firestore rules tests failed:', error);
    throw error;
  } finally {
    await teardownTestEnvironment();
  }
}

/**
 * Export for use in other scripts
 */
export {
  setupTestEnvironment,
  teardownTestEnvironment,
  testBookingRules,
  testTimeSlotRules,
  testQueryRules,
  runAllTests
};

/**
 * Run tests if this script is executed directly
 */
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('Rules validation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Rules validation failed:', error);
      process.exit(1);
    });
}