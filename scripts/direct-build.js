#!/usr/bin/env node

// Direct build script that ensures memory allocation
console.log('=================================');
console.log('DIRECT BUILD SCRIPT EXECUTING');
console.log('=================================');
console.log('Starting direct build with proper memory allocation...');
console.log(`Process ID: ${process.pid}`);
console.log(`Node version: ${process.version}`);
console.log(`Current heap limit: ${process.resourceUsage().maxRSS / 1024 / 1024} MB`);
console.log(`NODE_OPTIONS: ${process.env.NODE_OPTIONS}`);
console.log(`Memory limit: ${require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);
console.log('=================================');

// Force garbage collection if available
if (global.gc) {
  console.log('Running garbage collection...');
  global.gc();
}

// Import and run Next.js build directly
const { build } = require('next/dist/build');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');

console.log('Building Next.js application...');
console.log(`Project directory: ${projectDir}`);

// Run the build
build(projectDir, {
  // Build configuration
  lint: true,
  mangling: true,
  typeCheck: true,
  experimentalBuildMode: 'default'
}).then(() => {
  console.log('Build completed successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});