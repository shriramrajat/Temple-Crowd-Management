# Firestore Setup for Darshan Booking

This directory contains the complete Firestore configuration for the Darshan Booking system.

## Quick Setup

1. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Initialize Firestore data structure**:
   ```bash
   npm run firestore:init
   ```

3. **Deploy Firestore rules and indexes** (for production):
   ```bash
   npm run firestore:deploy
   ```

4. **Validate security rules** (optional):
   ```bash
   npm run firestore:validate
   ```

## Files Created

- `firestore.rules` - Security rules for data access control
- `firestore.indexes.json` - Composite indexes for query optimization
- `firebase.json` - Updated with Firestore configuration
- `scripts/initializeFirestore.ts` - Data initialization script
- `scripts/validateFirestoreRules.ts` - Rules validation script
- `docs/FIRESTORE_SETUP.md` - Comprehensive documentation
- `package.json` - Updated with Firestore scripts

## Available Scripts

- `npm run firestore:init` - Initialize time slots and data structure
- `npm run firestore:validate` - Test security rules
- `npm run firestore:deploy` - Deploy rules and indexes
- `npm run firestore:deploy:rules` - Deploy only rules
- `npm run firestore:deploy:indexes` - Deploy only indexes

## Collections Structure

### Bookings (`/bookings`)
- User booking records with authentication-based access control
- Auto-generated document IDs
- Tracks booking status and timestamps

### Time Slots (`/timeSlots`)
- Available time slots with capacity tracking
- Document ID format: `YYYY-MM-DD-HH-MM`
- Real-time availability calculation

## Security Features

- Authentication required for all operations
- Users can only access their own bookings
- Time-based booking restrictions (2 hours minimum, 30 days maximum advance)
- Capacity validation and overbooking prevention
- Audit trail preservation (no deletions allowed)

## Next Steps

After running the setup:

1. Test the booking flow with the existing components
2. Verify security rules in Firebase Console
3. Monitor query performance and adjust indexes if needed
4. Set up regular maintenance for time slot generation

For detailed information, see `docs/FIRESTORE_SETUP.md`.