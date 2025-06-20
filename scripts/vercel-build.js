#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('=== Vercel Build Script ===');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

// Check environment
console.log('\n=== Environment Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('CI:', process.env.CI);

// Try to generate Prisma client
console.log('\n=== Generating Prisma Client ===');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✓ Prisma client generated successfully');
} catch (error) {
  console.error('✗ Prisma generation failed:', error.message);
  process.exit(1);
}

// Try to build Next.js
console.log('\n=== Building Next.js ===');
try {
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1'
    }
  });
  console.log('✓ Next.js build completed successfully');
} catch (error) {
  console.error('✗ Next.js build failed:', error.message);
  process.exit(1);
}

console.log('\n=== Build Complete ===');