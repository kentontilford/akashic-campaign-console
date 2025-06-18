#!/usr/bin/env node

// Chunked build script to reduce memory usage by building pages in batches
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Starting Chunked Build Process ===');
console.log('This build splits pages into chunks to reduce memory usage');
console.log('');

// Helper function to get all page files
function getPageFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.startsWith('_') && !item.startsWith('.')) {
      getPageFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
      files.push(fullPath);
    }
  }
  return files;
}

// Get all pages
const appDir = path.join(process.cwd(), 'src/app');
const allPages = getPageFiles(appDir);
console.log(`Found ${allPages.length} page files`);

// Create temporary next.config for chunked builds
const nextConfigChunked = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  swcMinify: false,
  experimental: {
    workerThreads: false,
    cpus: 1,
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  productionBrowserSourceMaps: false,
  // Custom page extensions to control which pages are built
  pageExtensions: process.env.BUILD_PAGES ? ['chunk.tsx', 'chunk.ts'] : ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config) => {
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
      minimize: false,
    };
    return config;
  },
}

export default nextConfig;
`;

// Backup original config
const configPath = path.join(process.cwd(), 'next.config.mjs');
const backupPath = path.join(process.cwd(), 'next.config.backup.mjs');
fs.copyFileSync(configPath, backupPath);

try {
  // Write chunked config
  fs.writeFileSync(configPath, nextConfigChunked);
  
  // Build in chunks
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < allPages.length; i += chunkSize) {
    chunks.push(allPages.slice(i, i + chunkSize));
  }
  
  console.log(`Building in ${chunks.length} chunks...`);
  
  // Clean build directory
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  
  // First, build with no pages to get base infrastructure
  console.log('Building base infrastructure...');
  process.env.BUILD_PAGES = 'none';
  execSync('NODE_OPTIONS="--max-old-space-size=2048" npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  
  // Then build pages in chunks
  for (let i = 0; i < chunks.length; i++) {
    console.log(`\nBuilding chunk ${i + 1}/${chunks.length}...`);
    
    // Rename files in this chunk to .chunk.tsx
    const chunk = chunks[i];
    for (const file of chunk) {
      const ext = path.extname(file);
      const base = file.slice(0, -ext.length);
      fs.renameSync(file, `${base}.chunk${ext}`);
    }
    
    // Build this chunk
    process.env.BUILD_PAGES = 'chunk';
    execSync('NODE_OPTIONS="--max-old-space-size=2048" npx next build', {
      stdio: 'inherit',
      env: {
        ...process.env,
        SKIP_ENV_VALIDATION: '1',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });
    
    // Rename files back
    for (const file of chunk) {
      const ext = path.extname(file);
      const base = file.slice(0, -ext.length);
      fs.renameSync(`${base}.chunk${ext}`, file);
    }
    
    // Log memory usage
    const memUsage = process.memoryUsage();
    console.log(`Memory after chunk ${i + 1}: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  // Final build with all pages
  console.log('\nFinalizing build...');
  delete process.env.BUILD_PAGES;
  
  // Restore original config
  fs.copyFileSync(backupPath, configPath);
  
  execSync('NODE_OPTIONS="--max-old-space-size=4096" npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_ENV_VALIDATION: '1',
      NEXT_TELEMETRY_DISABLED: '1'
    }
  });
  
  console.log('\n=== Chunked build completed successfully! ===');
  
} catch (error) {
  console.error('Chunked build failed:', error.message);
  
  // Restore original config
  fs.copyFileSync(backupPath, configPath);
  fs.unlinkSync(backupPath);
  
  process.exit(1);
} finally {
  // Clean up backup
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
  }
}