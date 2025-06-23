#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Deployment Pre-Check\n');

let issues = 0;

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.log('❌ Node.js version is too old. Vercel requires Node.js 18.x or higher');
  console.log(`   Current: ${nodeVersion}`);
  issues++;
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Check package.json
if (!fs.existsSync('package.json')) {
  console.log('❌ package.json not found');
  issues++;
} else {
  console.log('✅ package.json found');
}

// Check build script
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.scripts?.build) {
    console.log('❌ No build script in package.json');
    issues++;
  } else {
    console.log(`✅ Build script: "${packageJson.scripts.build}"`);
  }
} catch (error) {
  console.log('❌ Failed to read package.json');
  issues++;
}

// Check Prisma schema
if (!fs.existsSync('prisma/schema.prisma')) {
  console.log('⚠️  Prisma schema not found - Prisma commands may fail');
} else {
  console.log('✅ Prisma schema found');
}

// Check Next.js pages
const hasAppDir = fs.existsSync('src/app') || fs.existsSync('app');
const hasPagesDir = fs.existsSync('src/pages') || fs.existsSync('pages');

if (!hasAppDir && !hasPagesDir) {
  console.log('❌ No Next.js app or pages directory found');
  issues++;
} else {
  console.log(`✅ Next.js structure: ${hasAppDir ? 'App Router' : 'Pages Router'}`);
}

// Check vercel.json
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json found');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.buildCommand) {
      console.log(`   Build command: "${vercelConfig.buildCommand}"`);
    }
  } catch (error) {
    console.log('⚠️  Failed to parse vercel.json');
  }
} else {
  console.log('⚠️  No vercel.json found (using defaults)');
}

// Summary
console.log('\n📊 Summary:');
if (issues === 0) {
  console.log('✅ No issues found! Ready to deploy.');
  console.log('\n🚀 Deploy with: npx vercel --prod');
} else {
  console.log(`❌ Found ${issues} issue(s) that may prevent deployment.`);
  console.log('\nFix these issues before deploying.');
}

// Environment variables reminder
console.log('\n📝 Required Environment Variables in Vercel:');
console.log('   - DATABASE_URL or DIRECT_URL');
console.log('   - NEXTAUTH_SECRET');
console.log('   - NEXTAUTH_URL');
console.log('   - OPENAI_API_KEY');
console.log('   - SKIP_ENV_VALIDATION=1');