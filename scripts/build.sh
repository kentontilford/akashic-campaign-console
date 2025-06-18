#!/bin/bash
# Build script for Railway deployment

echo "Starting build process..."

# Set environment variables for build
export SKIP_ENV_VALIDATION=1
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# Set dummy values for build time
export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
export NEXTAUTH_SECRET="dummy-secret-for-build"
export NEXTAUTH_URL="https://example.com"

# Generate Prisma client
echo "Generating Prisma client..."
npm run prisma:generate

# Build Next.js
echo "Building Next.js application..."
npx next build

echo "Build completed successfully!"