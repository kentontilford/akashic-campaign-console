#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Ensuring Prisma Client ===');

const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');

if (!fs.existsSync(prismaClientPath)) {
  console.log('Prisma client not found, generating...');
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✓ Prisma client generated successfully');
  } catch (error) {
    console.error('✗ Failed to generate Prisma client:', error.message);
    // Don't exit with error to allow build to continue
  }
} else {
  console.log('✓ Prisma client already exists');
}

// Check if the schema file exists
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('✗ Prisma schema file not found at:', schemaPath);
} else {
  console.log('✓ Prisma schema file found');
}