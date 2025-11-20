-- Manual Migration: Remove Email Verification
-- Run this SQL script manually on your database

-- Step 1: Remove email verification fields from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "isEmailVerified";
ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerifiedAt";

-- Step 2: Drop verification tokens table
DROP TABLE IF EXISTS "verification_tokens";

-- Migration complete
-- After running this, regenerate Prisma client with: npx prisma generate
