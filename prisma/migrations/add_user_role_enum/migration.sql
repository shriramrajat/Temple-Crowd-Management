-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PILGRIM', 'ADMIN');

-- AlterTable: Add role column to users table with default value
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'PILGRIM';

-- Create index on role column for better query performance
CREATE INDEX "users_role_idx" ON "users"("role");

-- Migrate existing admin users from admin_users table to users table
INSERT INTO "users" (id, email, "passwordHash", name, role, "createdAt", "updatedAt")
SELECT 
    id,
    email,
    "passwordHash",
    'Admin' as name,
    'ADMIN'::"UserRole" as role,
    "createdAt",
    NOW() as "updatedAt"
FROM "admin_users"
ON CONFLICT (email) DO NOTHING;

-- Note: The admin_users table can be dropped after verifying the migration
-- DROP TABLE "admin_users";
