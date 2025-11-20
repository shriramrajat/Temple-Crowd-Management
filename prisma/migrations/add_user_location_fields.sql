-- Add location fields to users table
-- Run this migration manually in your database

-- Manual entry fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" VARCHAR(500);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinCode" VARCHAR(10);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" VARCHAR(100) DEFAULT 'India';

-- Google Maps / GPS fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "formattedAddress" VARCHAR(500);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "placeId" VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN "users"."address" IS 'User manually entered address';
COMMENT ON COLUMN "users"."latitude" IS 'GPS latitude from Google Maps';
COMMENT ON COLUMN "users"."longitude" IS 'GPS longitude from Google Maps';
COMMENT ON COLUMN "users"."formattedAddress" IS 'Formatted address from Google Maps API';
COMMENT ON COLUMN "users"."placeId" IS 'Google Maps Place ID for location reference';
