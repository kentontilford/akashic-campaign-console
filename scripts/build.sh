#!/bin/bash
# Build script for Railway deployment

echo "Starting build process..."

# Set environment variables for build
export SKIP_ENV_VALIDATION=1
export NODE_OPTIONS="--max-old-space-size=4096"

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Build Next.js
echo "Building Next.js application..."
next build

echo "Build completed successfully!"