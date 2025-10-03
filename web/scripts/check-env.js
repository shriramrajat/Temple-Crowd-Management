#!/usr/bin/env node

/**
 * Environment Check Script
 * 
 * This script validates that all required environment variables are present
 * and properly formatted. Run this before deployment or when setting up
 * a new development environment.
 */

const fs = require('fs');
const path = require('path');

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const optionalVars = [
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  // Check if .env.local exists
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    console.log('💡 Copy .env.example to .env.local and fill in your Firebase configuration');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config({ path: envPath });
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  console.log('📋 Required Variables:');
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      console.error(`❌ ${varName} is missing`);
      hasErrors = true;
    } else if (value.includes('your_') || value.includes('_here')) {
      console.warn(`⚠️  ${varName} appears to be a placeholder value`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName} is set`);
    }
  }
  
  // Check optional variables
  console.log('\n📋 Optional Variables:');
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`ℹ️  ${varName} is not set (optional)`);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  if (hasErrors) {
    console.error('❌ Environment configuration has errors');
    console.log('💡 Please check your .env.local file and ensure all required variables are set');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  Environment configuration has warnings');
    console.log('💡 Please verify that placeholder values have been replaced with actual Firebase configuration');
  } else {
    console.log('✅ Environment configuration looks good!');
  }
}

// Run the check
checkEnvironment();