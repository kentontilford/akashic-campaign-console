#!/bin/sh

# Shell script to ensure memory allocation is applied
echo "=== Build Script Starting ==="
echo "Memory limit before: $(ulimit -v)"

# Set ulimit if possible
ulimit -v unlimited 2>/dev/null || echo "Cannot set unlimited virtual memory"

# Display current memory settings
echo "NODE_OPTIONS: ${NODE_OPTIONS}"
echo "Current memory usage:"
free -m 2>/dev/null || echo "free command not available"

# Execute build with explicit memory allocation
echo "Starting build with 4096MB heap..."
exec node \
  --max-old-space-size=4096 \
  --expose-gc \
  scripts/direct-build.js