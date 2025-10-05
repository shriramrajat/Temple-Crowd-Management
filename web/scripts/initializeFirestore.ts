/**
 * Firestore Data Initialization Script
 * 
 * This script initializes the Firestore collections with proper structure
 * and sample time slots for the darshan booking system.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../src/services/firebase/config';
import { FIRESTORE_COLLECTIONS, TIME_SLOT_CONFIG, BOOKING_VALIDATION } from '../src/constants/booking';

/**
 * Generate time slots for a given date
 */
function generateTimeSlotsForDate(date: Date): Array<{
  id: string;
  date: Date;
  time: string;
  capacity: number;
  booked: number;
  available: boolean;
}> {
  const slots = [];
  const startHour = 6; // 6 AM
  const endHour = 20; // 8 PM
  const intervalMinutes = TIME_SLOT_CONFIG.INTERVAL_MINUTES;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);
      
      // Create slot ID in format: YYYY-MM-DD-HH-MM
      const slotId = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}-${hour.toString().padStart(2, '0')}-${minute.toString().padStart(2, '0')}`;
      
      slots.push({
        id: slotId,
        date: slotDate,
        time: timeString,
        capacity: TIME_SLOT_CONFIG.DEFAULT_CAPACITY,
        booked: 0,
        available: true
      });
    }
  }
  
  return slots;
}

/**
 * Initialize time slots for the next 30 days
 */
async function initializeTimeSlots(): Promise<void> {
  console.log('Initializing time slots...');
  
  const timeSlotsCollection = collection(db, FIRESTORE_COLLECTIONS.TIME_SLOTS);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < BOOKING_VALIDATION.MAX_ADVANCE_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const slots = generateTimeSlotsForDate(date);
    
    for (const slot of slots) {
      const slotDoc = doc(timeSlotsCollection, slot.id);
      
      await setDoc(slotDoc, {
        date: Timestamp.fromDate(slot.date),
        time: slot.time,
        capacity: slot.capacity,
        booked: slot.booked,
        available: slot.available,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    console.log(`Created time slots for ${date.toDateString()}`);
  }
  
  console.log('Time slots initialization completed');
}

/**
 * Create sample booking document structure (for reference)
 */
async function createSampleBookingStructure(): Promise<void> {
  console.log('Creating sample booking document structure...');
  
  const bookingsCollection = collection(db, FIRESTORE_COLLECTIONS.BOOKINGS);
  const sampleBookingDoc = doc(bookingsCollection, 'sample-booking-structure');
  
  // This is just for structure reference - will be deleted after creation
  await setDoc(sampleBookingDoc, {
    userId: 'sample-user-id',
    slotTime: Timestamp.fromDate(new Date()),
    status: 'confirmed',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    _isStructureReference: true // Flag to identify this as a structure reference
  });
  
  console.log('Sample booking structure created');
}

/**
 * Main initialization function
 */
export async function initializeFirestore(): Promise<void> {
  try {
    console.log('Starting Firestore initialization...');
    
    await initializeTimeSlots();
    await createSampleBookingStructure();
    
    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    throw error;
  }
}

/**
 * Run initialization if this script is executed directly
 */
if (require.main === module) {
  initializeFirestore()
    .then(() => {
      console.log('Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization script failed:', error);
      process.exit(1);
    });
}