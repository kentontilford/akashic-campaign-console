#!/usr/bin/env node

// Safe Prisma generation for Vercel builds
const { execSync } = require('child_process');

console.log('Checking for database URL...');

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.log('No DATABASE_URL found, using placeholder for build...');
  process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
}

try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully!');
} catch (error) {
  console.error('Warning: Prisma generation failed, but continuing build...');
  // Don't exit with error - let the build continue
}