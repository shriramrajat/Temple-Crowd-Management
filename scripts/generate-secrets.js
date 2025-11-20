#!/usr/bin/env node

/**
 * Generate Secrets Script
 * 
 * This script generates secure random secrets for deployment.
 * Run this before deploying to production to generate:
 * - NEXTAUTH_SECRET
 * - QR_SECRET_KEY
 * - CSRF_SECRET
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Secure Secrets for Production Deployment\n');
console.log('=' .repeat(60));

// Generate NEXTAUTH_SECRET (base64)
const nextAuthSecret = crypto.randomBytes(32).toString('base64');
console.log('\n📝 NEXTAUTH_SECRET (for NextAuth.js authentication):');
console.log(nextAuthSecret);

// Generate QR_SECRET_KEY (hex)
const qrSecretKey = crypto.randomBytes(32).toString('hex');
console.log('\n📝 QR_SECRET_KEY (for QR code signing):');
console.log(qrSecretKey);

// Generate CSRF_SECRET (hex)
const csrfSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 CSRF_SECRET (optional, for CSRF protection):');
console.log(csrfSecret);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('   1. Keep these secrets secure and never commit them to Git');
console.log('   2. Add them to Vercel environment variables');
console.log('   3. Use different secrets for development and production');
console.log('   4. Rotate secrets periodically for better security');

console.log('\n📋 Next Steps:');
console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
console.log('   2. Add each secret as a new environment variable');
console.log('   3. Set the environment to "Production", "Preview", and "Development"');
console.log('   4. Save and redeploy your application');

console.log('\n✅ Secrets generated successfully!\n');
