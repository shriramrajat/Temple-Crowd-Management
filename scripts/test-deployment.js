#!/usr/bin/env node

/**
 * Deployment Test Script
 * 
 * This script tests the deployment by making HTTP requests to verify
 * that all critical endpoints are working correctly.
 * 
 * Usage:
 *   node scripts/test-deployment.js [URL]
 * 
 * Example:
 *   node scripts/test-deployment.js https://your-app.vercel.app
 */

const https = require('https');
const http = require('http');

// Get URL from command line argument or use default
const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log('\n🧪 Testing Deployment\n');
console.log('=' .repeat(60));
console.log(`\n🌐 Base URL: ${baseUrl}\n`);

let testsPassed = 0;
let testsFailed = 0;

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test cases
const tests = [
  {
    name: 'Homepage loads',
    url: baseUrl,
    expectedStatus: 200,
  },
  {
    name: 'Darshan booking page loads',
    url: `${baseUrl}/darshan`,
    expectedStatus: 200,
  },
  {
    name: 'Admin login page loads',
    url: `${baseUrl}/admin/login`,
    expectedStatus: 200,
  },
  {
    name: 'Staff scanner page loads',
    url: `${baseUrl}/staff/scanner`,
    expectedStatus: 200,
  },
  {
    name: 'API health check (slots endpoint)',
    url: `${baseUrl}/api/slots?date=${new Date().toISOString().split('T')[0]}`,
    expectedStatus: 200,
    checkJson: true,
  },
];

// Run tests
async function runTests() {
  console.log('🔍 Running Tests...\n');

  for (const test of tests) {
    try {
      const response = await makeRequest(test.url);
      
      if (response.statusCode === test.expectedStatus) {
        console.log(`✅ ${test.name}`);
        console.log(`   Status: ${response.statusCode}`);
        
        if (test.checkJson) {
          try {
            const json = JSON.parse(response.body);
            console.log(`   Response: Valid JSON`);
          } catch (e) {
            console.log(`   ⚠️  Response: Invalid JSON`);
          }
        }
        
        testsPassed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Expected: ${test.expectedStatus}, Got: ${response.statusCode}`);
        testsFailed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
      testsFailed++;
    }
    
    console.log('');
  }

  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`   Total Tests: ${tests.length}`);
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Deployment is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.\n');
    console.log('💡 Common issues:');
    console.log('   - Database not migrated: Run "npx prisma migrate deploy"');
    console.log('   - Environment variables missing: Check Vercel dashboard');
    console.log('   - Build errors: Check Vercel build logs');
    console.log('   - Server not running: Ensure deployment is complete\n');
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('\n❌ Test runner error:', error.message);
  process.exit(1);
});
