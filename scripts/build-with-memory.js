#!/usr/bin/env node

// Custom build script with explicit memory management
const { spawn } = require('child_process');
const path = require('path');

// Set memory limit
const memoryLimit = process.env.BUILD_MEMORY || '4096';
console.log(`Building with ${memoryLimit}MB memory limit...`);

// Path to Next.js CLI
const nextPath = path.join(__dirname, '..', 'node_modules', '.bin', 'next');

// Build command with memory settings
const buildProcess = spawn('node', [
  `--max-old-space-size=${memoryLimit}`,
  nextPath,
  'build'
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: `--max-old-space-size=${memoryLimit}`
  }
});

buildProcess.on('exit', (code) => {
  process.exit(code);
});

buildProcess.on('error', (err) => {
  console.error('Build failed:', err);
  process.exit(1);
});