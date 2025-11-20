/**
 * Migration Script: Add User Roles
 * 
 * This script helps migrate the database to use the new unified User model with roles.
 * Run this after updating the Prisma schema.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting User Role Migration...\n');

// Step 1: Generate Prisma Client
console.log('📦 Step 1: Generating Prisma Client...');
try {
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma Client generated successfully\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma Client');
  console.error('Please close any applications using the database and try again.');
  process.exit(1);
}

// Step 2: Create Migration
console.log('📝 Step 2: Creating database migration...');
try {
  execSync('npx prisma migrate dev --name add_user_role_enum', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Migration created and applied successfully\n');
} catch (error) {
  console.error('❌ Failed to create migration');
  console.error('Please check your database connection and try again.');
  process.exit(1);
}

console.log('✨ Migration completed successfully!');
console.log('\nNext steps:');
console.log('1. Test admin registration at /admin/register');
console.log('2. Test admin login at /admin/login');
console.log('3. Test pilgrim registration at /register');
console.log('4. Test pilgrim login at /login');
console.log('5. Verify navigation shows correctly for authenticated/unauthenticated users\n');
