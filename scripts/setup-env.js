#!/usr/bin/env node

/**
 * Environment Setup Helper Script
 * 
 * This script helps you set up your .env file for local development.
 * It copies .env.example to .env if it doesn't exist.
 */

const fs = require('fs');
const path = require('path');

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

console.log('\n🔧 Environment Setup Helper\n');
console.log('=' .repeat(60));

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env file already exists');
  console.log('   Location:', envPath);
  console.log('\n⚠️  If you need to reset it, delete .env and run this script again.');
} else {
  // Copy .env.example to .env
  try {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('\n✅ Created .env file from .env.example');
    console.log('   Location:', envPath);
    console.log('\n📝 Next Steps:');
    console.log('   1. Open .env file in your editor');
    console.log('   2. Replace placeholder values with your actual configuration:');
    console.log('      - DATABASE_URL: Your PostgreSQL connection string');
    console.log('      - NEXTAUTH_SECRET: Run "npm run generate:secrets" to generate');
    console.log('      - RESEND_API_KEY: Get from https://resend.com');
    console.log('      - QR_SECRET_KEY: Run "npm run generate:secrets" to generate');
    console.log('   3. Save the file');
    console.log('   4. Run "npm run db:migrate" to set up the database');
    console.log('   5. Run "npm run db:seed" to create initial data');
    console.log('   6. Run "npm run dev" to start development server');
  } catch (error) {
    console.error('\n❌ Error creating .env file:', error.message);
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Helpful Commands:');
console.log('   npm run generate:secrets  - Generate secure secrets');
console.log('   npm run db:migrate        - Run database migrations');
console.log('   npm run db:seed           - Seed initial data');
console.log('   npm run dev               - Start development server');
console.log('   npm run build             - Build for production');

console.log('\n📚 Documentation:');
console.log('   - DEPLOYMENT.md: Complete deployment guide');
console.log('   - DEPLOYMENT_CHECKLIST.md: Pre-deployment checklist');
console.log('   - .env.example: Environment variables reference');

console.log('\n');
