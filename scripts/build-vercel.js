#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel Build Process...');
console.log('Node version:', process.version);
console.log('Memory limit:', process.env.NODE_OPTIONS || 'default');

// Step 1: Check environment
console.log('\n📋 Environment Check:');
const requiredEnvVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
const dbVars = ['DATABASE_URL', 'DIRECT_URL', 'POSTGRES_URL'];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`⚠️  ${varName}: Missing (build will continue)`);
  }
});

// Check if any database URL is set
const hasDbUrl = dbVars.some(varName => !!process.env[varName]);
if (hasDbUrl) {
  console.log('✅ Database URL: Found');
} else {
  console.log('⚠️  Database URL: Missing - using placeholder for build');
  // Set a placeholder DATABASE_URL for Prisma to generate client
  process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/db?schema=public';
}

// Step 2: Install dependencies (if needed)
if (!fs.existsSync('node_modules')) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm ci --prefer-offline --no-audit', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
  }
}

// Step 3: Generate Prisma Client
console.log('\n🔧 Generating Prisma Client...');
try {
  // Use a minimal generate to save memory
  execSync('npx prisma generate --generator client', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_HIDE_UPDATE_MESSAGE: 'true'
    }
  });
  console.log('✅ Prisma Client generated successfully');
} catch (error) {
  console.error('❌ Prisma generation failed:', error.message);
  // Continue anyway - the app might not need Prisma
  console.log('⚠️  Continuing without Prisma client...');
}

// Step 4: Build Next.js
console.log('\n🏗️  Building Next.js application...');
try {
  execSync('next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  console.log('\n✅ Build completed successfully!');
} catch (error) {
  console.error('\n❌ Next.js build failed');
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('\n🎉 Vercel build process completed!');