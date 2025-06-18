#!/usr/bin/env node

// Minimal build script with optimizations disabled
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting Minimal Build Process ===');
console.log('Memory allocation:', process.env.NODE_OPTIONS);
console.log('');

// Set environment variables for minimal build
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.SKIP_ENV_VALIDATION = '1';
process.env.NODE_ENV = 'production';

// Disable all Next.js build optimizations
process.env.NEXT_DISABLE_SWC = 'true';
process.env.NEXT_PRIVATE_MINIMIZE = 'false';
process.env.NEXT_PRIVATE_TEST_PROXY = 'false';

// Log memory usage before build
const v8 = require('v8');
console.log('Heap limit:', v8.getHeapStatistics().heap_size_limit / 1024 / 1024, 'MB');
console.log('Initial heap:', v8.getHeapStatistics().used_heap_size / 1024 / 1024, 'MB');
console.log('');

try {
  // Clean previous builds
  console.log('Cleaning previous builds...');
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  
  // Use minimal config
  const minimalConfig = path.join(process.cwd(), 'next.config.minimal.mjs');
  const originalConfig = path.join(process.cwd(), 'next.config.mjs');
  const backupConfig = path.join(process.cwd(), 'next.config.backup.mjs');
  
  // Backup original config
  if (fs.existsSync(originalConfig)) {
    fs.copyFileSync(originalConfig, backupConfig);
  }
  
  // Use minimal config
  if (fs.existsSync(minimalConfig)) {
    fs.copyFileSync(minimalConfig, originalConfig);
    console.log('Using minimal configuration...');
  }
  
  // Run build
  console.log('Starting Next.js build with minimal optimizations...');
  execSync('npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });
  
  // Restore original config
  if (fs.existsSync(backupConfig)) {
    fs.copyFileSync(backupConfig, originalConfig);
    fs.unlinkSync(backupConfig);
  }
  
  console.log('');
  console.log('=== Build completed successfully! ===');
  
  // Log final memory usage
  console.log('Final heap:', v8.getHeapStatistics().used_heap_size / 1024 / 1024, 'MB');
  
} catch (error) {
  console.error('Build failed:', error.message);
  
  // Restore original config on error
  const backupConfig = path.join(process.cwd(), 'next.config.backup.mjs');
  const originalConfig = path.join(process.cwd(), 'next.config.mjs');
  if (fs.existsSync(backupConfig)) {
    fs.copyFileSync(backupConfig, originalConfig);
    fs.unlinkSync(backupConfig);
  }
  
  process.exit(1);
}