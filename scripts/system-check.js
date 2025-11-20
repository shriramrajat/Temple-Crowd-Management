#!/usr/bin/env node

/**
 * System Check Script
 * 
 * This script verifies that all services and configurations are working correctly.
 * It checks:
 * - Environment variables
 * - Database connection
 * - Email service configuration
 * - NextAuth configuration
 * - Google Maps API
 * - Prisma client
 */

require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('../lib/generated/prisma');
const { Resend } = require('resend');

console.log('\n🔍 System Check - Verifying All Services\n');
console.log('='.repeat(70));

let checksPassed = 0;
let checksFailed = 0;
let warnings = 0;
const results = [];

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  console.log('\n📋 Checking Environment Variables...\n');
  
  const requiredVars = [
    { name: 'DATABASE_URL', required: true, mask: true },
    { name: 'NEXTAUTH_SECRET', required: true, mask: true },
    { name: 'NEXTAUTH_URL', required: true, mask: false },
    { name: 'RESEND_API_KEY', required: true, mask: true },
    { name: 'EMAIL_FROM', required: false, mask: false },
  ];
  
  const optionalVars = [
    { name: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY', required: false, mask: true },
    { name: 'ADMIN_EMAILS', required: false, mask: false },
    { name: 'QR_SECRET_KEY', required: false, mask: true },
    { name: 'CSRF_SECRET', required: false, mask: true },
  ];
  
  let envPassed = true;
  
  // Check required variables
  requiredVars.forEach(v => {
    const value = process.env[v.name];
    if (!value || value.trim() === '') {
      console.log(`   ❌ ${v.name} - MISSING`);
      results.push({ service: 'Environment', check: v.name, status: 'FAILED', message: 'Missing required variable' });
      checksFailed++;
      envPassed = false;
    } else {
      const displayValue = v.mask ? `${value.substring(0, 10)}...` : value;
      console.log(`   ✅ ${v.name} - ${displayValue}`);
      results.push({ service: 'Environment', check: v.name, status: 'PASSED' });
      checksPassed++;
    }
  });
  
  // Check optional variables
  optionalVars.forEach(v => {
    const value = process.env[v.name];
    if (!value || value.trim() === '') {
      console.log(`   ⚠️  ${v.name} - NOT SET (optional)`);
      results.push({ service: 'Environment', check: v.name, status: 'WARNING', message: 'Optional variable not set' });
      warnings++;
    } else {
      const displayValue = v.mask ? `${value.substring(0, 10)}...` : value;
      console.log(`   ✅ ${v.name} - ${displayValue}`);
      results.push({ service: 'Environment', check: v.name, status: 'PASSED' });
      checksPassed++;
    }
  });
  
  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
      console.log(`   ✅ DATABASE_URL format - Valid PostgreSQL connection string`);
    } else {
      console.log(`   ⚠️  DATABASE_URL format - Unexpected format`);
      warnings++;
    }
  }
  
  return envPassed;
}

/**
 * Check database connection
 */
async function checkDatabaseConnection() {
  console.log('\n🗄️  Checking Database Connection...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('   ✅ Database connection - SUCCESS');
    results.push({ service: 'Database', check: 'Connection', status: 'PASSED' });
    checksPassed++;
    
    // Test a simple query
    try {
      const result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log('   ✅ Database query - SUCCESS');
      results.push({ service: 'Database', check: 'Query', status: 'PASSED' });
      checksPassed++;
    } catch (error) {
      console.log(`   ❌ Database query - FAILED: ${error.message}`);
      results.push({ service: 'Database', check: 'Query', status: 'FAILED', message: error.message });
      checksFailed++;
    }
    
    // Check if tables exist
    try {
      const tables = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        LIMIT 5
      `;
      console.log(`   ✅ Database tables - Found ${tables.length} tables`);
      results.push({ service: 'Database', check: 'Tables', status: 'PASSED' });
      checksPassed++;
    } catch (error) {
      console.log(`   ⚠️  Database tables - Could not verify: ${error.message}`);
      warnings++;
    }
    
  } catch (error) {
    console.log(`   ❌ Database connection - FAILED: ${error.message}`);
    results.push({ service: 'Database', check: 'Connection', status: 'FAILED', message: error.message });
    checksFailed++;
    return false;
  } finally {
    await prisma.$disconnect();
  }
  
  return true;
}

/**
 * Check email service configuration
 */
async function checkEmailService() {
  console.log('\n📧 Checking Email Service (Resend)...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  if (!apiKey) {
    console.log('   ❌ RESEND_API_KEY - MISSING');
    results.push({ service: 'Email', check: 'API Key', status: 'FAILED', message: 'RESEND_API_KEY not set' });
    checksFailed++;
    return false;
  }
  
  console.log(`   ✅ RESEND_API_KEY - Set (${apiKey.substring(0, 10)}...)`);
  results.push({ service: 'Email', check: 'API Key', status: 'PASSED' });
  checksPassed++;
  
  console.log(`   ✅ EMAIL_FROM - ${fromEmail}`);
  results.push({ service: 'Email', check: 'From Address', status: 'PASSED' });
  checksPassed++;
  
  // Try to initialize Resend client (doesn't make API call)
  try {
    const resend = new Resend(apiKey);
    console.log('   ✅ Resend client - Initialized successfully');
    results.push({ service: 'Email', check: 'Client Init', status: 'PASSED' });
    checksPassed++;
    
    // Note: We don't make an actual API call to test, as that would consume credits
    console.log('   ℹ️  Note: Email API key validity not tested (to avoid consuming credits)');
    
  } catch (error) {
    console.log(`   ❌ Resend client - FAILED: ${error.message}`);
    results.push({ service: 'Email', check: 'Client Init', status: 'FAILED', message: error.message });
    checksFailed++;
    return false;
  }
  
  return true;
}

/**
 * Check NextAuth configuration
 */
function checkNextAuth() {
  console.log('\n🔐 Checking NextAuth Configuration...\n');
  
  const secret = process.env.NEXTAUTH_SECRET;
  const url = process.env.NEXTAUTH_URL;
  
  if (!secret) {
    console.log('   ❌ NEXTAUTH_SECRET - MISSING');
    results.push({ service: 'NextAuth', check: 'Secret', status: 'FAILED', message: 'NEXTAUTH_SECRET not set' });
    checksFailed++;
    return false;
  }
  
  if (secret.length < 32) {
    console.log(`   ⚠️  NEXTAUTH_SECRET - Too short (${secret.length} chars, recommended: 32+)`);
    warnings++;
  } else {
    console.log(`   ✅ NEXTAUTH_SECRET - Set (length: ${secret.length})`);
    results.push({ service: 'NextAuth', check: 'Secret', status: 'PASSED' });
    checksPassed++;
  }
  
  if (!url) {
    console.log('   ⚠️  NEXTAUTH_URL - NOT SET');
    warnings++;
  } else {
    console.log(`   ✅ NEXTAUTH_URL - ${url}`);
    results.push({ service: 'NextAuth', check: 'URL', status: 'PASSED' });
    checksPassed++;
    
    if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.log('   ⚠️  NEXTAUTH_URL - Using localhost in production environment');
      warnings++;
    }
  }
  
  return true;
}

/**
 * Check Google Maps API
 */
function checkGoogleMaps() {
  console.log('\n🗺️  Checking Google Maps API...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.log('   ⚠️  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY - NOT SET (optional)');
    console.log('   ℹ️  Location auto-fill features will not work without this key');
    results.push({ service: 'Google Maps', check: 'API Key', status: 'WARNING', message: 'Not set (optional)' });
    warnings++;
    return false;
  }
  
  console.log(`   ✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY - Set (${apiKey.substring(0, 10)}...)`);
  results.push({ service: 'Google Maps', check: 'API Key', status: 'PASSED' });
  checksPassed++;
  
  // Note: We don't make an actual API call to test, as that might consume quota
  console.log('   ℹ️  Note: API key validity not tested (to avoid consuming quota)');
  
  return true;
}

/**
 * Check Prisma client
 */
function checkPrismaClient() {
  console.log('\n🔧 Checking Prisma Client...\n');
  
  try {
    const prisma = new PrismaClient();
    console.log('   ✅ Prisma Client - Generated and importable');
    results.push({ service: 'Prisma', check: 'Client', status: 'PASSED' });
    checksPassed++;
    
    // Check if common models are available (using snake_case as per schema)
    const models = ['admin_users', 'users', 'bookings', 'slots'];
    models.forEach(model => {
      if (prisma[model]) {
        console.log(`   ✅ Prisma Model - ${model} available`);
      } else {
        console.log(`   ⚠️  Prisma Model - ${model} not found`);
        warnings++;
      }
    });
    
  } catch (error) {
    console.log(`   ❌ Prisma Client - FAILED: ${error.message}`);
    console.log('   💡 Try running: npm run db:generate');
    results.push({ service: 'Prisma', check: 'Client', status: 'FAILED', message: error.message });
    checksFailed++;
    return false;
  }
  
  return true;
}

/**
 * Main function
 */
async function runSystemCheck() {
  try {
    // Check environment variables
    const envOk = checkEnvironmentVariables();
    
    // Check Prisma client (can run without DB connection)
    checkPrismaClient();
    
    // Check database connection (only if env vars are OK)
    if (envOk && process.env.DATABASE_URL) {
      await checkDatabaseConnection();
    } else {
      console.log('\n🗄️  Skipping Database Check (DATABASE_URL not set)\n');
    }
    
    // Check email service
    await checkEmailService();
    
    // Check NextAuth
    checkNextAuth();
    
    // Check Google Maps
    checkGoogleMaps();
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 System Check Summary\n');
    console.log(`   ✅ Passed: ${checksPassed}`);
    console.log(`   ❌ Failed: ${checksFailed}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   📈 Total Checks: ${checksPassed + checksFailed + warnings}`);
    
    // Detailed results
    console.log('\n📋 Detailed Results:\n');
    
    const groupedResults = results.reduce((acc, r) => {
      if (!acc[r.service]) acc[r.service] = [];
      acc[r.service].push(r);
      return acc;
    }, {});
    
    Object.keys(groupedResults).forEach(service => {
      console.log(`   ${service}:`);
      groupedResults[service].forEach(result => {
        const icon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
        const message = result.message ? ` - ${result.message}` : '';
        console.log(`      ${icon} ${result.check}${message}`);
      });
    });
    
    // Final verdict
    console.log('\n' + '='.repeat(70));
    if (checksFailed === 0 && warnings === 0) {
      console.log('\n🎉 All checks passed! System is ready.\n');
      process.exit(0);
    } else if (checksFailed === 0) {
      console.log('\n✅ All critical checks passed! Some warnings present.\n');
      console.log('💡 Review warnings above for optional configurations.\n');
      process.exit(0);
    } else {
      console.log('\n❌ Some checks failed. Please fix the issues above.\n');
      console.log('💡 Tips:');
      console.log('   - Verify all required environment variables are set in .env');
      console.log('   - Check database connection string is correct');
      console.log('   - Ensure Prisma client is generated: npm run db:generate');
      console.log('   - Run database migrations: npm run db:migrate\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ System check error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the system check
runSystemCheck();
