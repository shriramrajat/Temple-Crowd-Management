#!/usr/bin/env node

/**
 * Deployment Readiness Checker
 * 
 * This script checks if your project is ready for deployment.
 * It verifies environment variables, database connection, and build status.
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Checking Deployment Readiness\n');
console.log('=' .repeat(60));

let allChecksPass = true;

// Check 1: Required files exist
console.log('\n📁 Checking Required Files...');
const requiredFiles = [
  '.env.example',
  'vercel.json',
  'prisma/schema.prisma',
  'package.json',
  'DEPLOYMENT.md',
  'DEPLOYMENT_CHECKLIST.md'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allChecksPass = false;
  }
});

// Check 2: Environment variables documented
console.log('\n🔐 Checking Environment Variables Documentation...');
const envExamplePath = path.join(__dirname, '..', '.env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf-8');
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'RESEND_API_KEY',
    'EMAIL_FROM',
    'QR_SECRET_KEY'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`   ✅ ${varName}`);
    } else {
      console.log(`   ❌ ${varName} - NOT DOCUMENTED`);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ .env.example not found');
  allChecksPass = false;
}

// Check 3: Vercel configuration
console.log('\n⚙️  Checking Vercel Configuration...');
const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    
    if (vercelConfig.buildCommand) {
      console.log(`   ✅ Build command configured: ${vercelConfig.buildCommand}`);
    } else {
      console.log('   ⚠️  No build command specified');
    }
    
    if (vercelConfig.framework === 'nextjs') {
      console.log('   ✅ Framework set to Next.js');
    } else {
      console.log('   ⚠️  Framework not set to Next.js');
    }
  } catch (error) {
    console.log('   ❌ Invalid vercel.json format');
    allChecksPass = false;
  }
} else {
  console.log('   ❌ vercel.json not found');
  allChecksPass = false;
}

// Check 4: Package.json scripts
console.log('\n📦 Checking Package Scripts...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const requiredScripts = [
    'build',
    'start',
    'db:migrate',
    'db:seed',
    'db:generate'
  ];
  
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ ${script}`);
    } else {
      console.log(`   ❌ ${script} - MISSING`);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ package.json not found');
  allChecksPass = false;
}

// Check 5: Prisma schema
console.log('\n🗄️  Checking Database Schema...');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const requiredModels = ['Slot', 'Booking', 'AdminUser'];
  
  requiredModels.forEach(model => {
    if (schemaContent.includes(`model ${model}`)) {
      console.log(`   ✅ ${model} model defined`);
    } else {
      console.log(`   ❌ ${model} model - MISSING`);
      allChecksPass = false;
    }
  });
} else {
  console.log('   ❌ prisma/schema.prisma not found');
  allChecksPass = false;
}

// Check 6: Seed script
console.log('\n🌱 Checking Seed Script...');
const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
if (fs.existsSync(seedPath)) {
  console.log('   ✅ Seed script exists');
} else {
  console.log('   ❌ Seed script not found');
  allChecksPass = false;
}

// Check 7: .gitignore
console.log('\n🚫 Checking .gitignore...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  const requiredIgnores = ['.env', 'node_modules', '.next'];
  
  requiredIgnores.forEach(ignore => {
    if (gitignoreContent.includes(ignore)) {
      console.log(`   ✅ ${ignore} ignored`);
    } else {
      console.log(`   ⚠️  ${ignore} not in .gitignore`);
    }
  });
} else {
  console.log('   ❌ .gitignore not found');
  allChecksPass = false;
}

// Final summary
console.log('\n' + '='.repeat(60));
if (allChecksPass) {
  console.log('\n✅ All checks passed! Your project is ready for deployment.\n');
  console.log('📋 Next Steps:');
  console.log('   1. Generate production secrets: npm run generate:secrets');
  console.log('   2. Set up database (Vercel Postgres, Supabase, etc.)');
  console.log('   3. Configure environment variables in Vercel');
  console.log('   4. Push to GitHub and deploy via Vercel');
  console.log('   5. Run migrations: npm run db:migrate');
  console.log('   6. Seed database: npm run db:seed');
  console.log('\n📚 See DEPLOYMENT.md for detailed instructions.\n');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed. Please fix the issues above before deploying.\n');
  console.log('💡 Tips:');
  console.log('   - Ensure all required files are present');
  console.log('   - Verify environment variables are documented');
  console.log('   - Check package.json scripts are configured');
  console.log('   - Review DEPLOYMENT_CHECKLIST.md for complete list');
  console.log('\n');
  process.exit(1);
}
