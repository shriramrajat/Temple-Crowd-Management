-- AlterTable: Update qrCode field from VARCHAR(500) to TEXT for both bookings and user_bookings
-- Requirements: 6.2 - Store QR code data URL in qrCode field (data URLs are ~17KB)

-- Update bookings table
ALTER TABLE "bookings" ALTER COLUMN "qrCode" TYPE TEXT;

-- Update user_bookings table
ALTER TABLE "user_bookings" ALTER COLUMN "qrCode" TYPE TEXT;
