#!/usr/bin/env node

console.log('=== Build Environment Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);
console.log('CI:', process.env.CI);

// Check for required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'OPENAI_API_KEY'
];

console.log('\n=== Required Environment Variables ===');
requiredEnvVars.forEach(varName => {
  const exists = !!process.env[varName];
  console.log(`${varName}: ${exists ? '✓ Set' : '✗ Missing'}`);
});

// Check for optional environment variables
const optionalEnvVars = [
  'DIRECT_URL',
  'REDIS_URL',
  'SKIP_ENV_VALIDATION',
  'SKIP_REDIS',
  'DISABLE_RATE_LIMITING'
];

console.log('\n=== Optional Environment Variables ===');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value || 'Not set'}`);
});

// Check Prisma
try {
  const { PrismaClient } = require('@prisma/client');
  console.log('\n=== Prisma Check ===');
  console.log('Prisma Client: ✓ Available');
} catch (error) {
  console.log('\n=== Prisma Check ===');
  console.log('Prisma Client: ✗ Error:', error.message);
}

// Check Node.js version
console.log('\n=== Node.js Version ===');
console.log('Version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);

// Memory info
console.log('\n=== Memory Info ===');
const used = process.memoryUsage();
for (let key in used) {
  console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
}

console.log('\n=== Build Test Complete ===');