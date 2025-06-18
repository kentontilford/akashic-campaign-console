// Quick script to verify Next.js build output
const fs = require('fs')
const path = require('path')

console.log('=== BUILD VERIFICATION ===')
console.log('Current directory:', process.cwd())
console.log('Node version:', process.version)

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next')
if (fs.existsSync(nextDir)) {
  console.log('✅ .next directory exists')
  
  // Check for key build artifacts
  const standaloneDir = path.join(nextDir, 'standalone')
  const staticDir = path.join(nextDir, 'static')
  
  console.log('Standalone exists:', fs.existsSync(standaloneDir))
  console.log('Static exists:', fs.existsSync(staticDir))
} else {
  console.log('❌ .next directory NOT found - build may have failed')
}

// Check for required files
const requiredFiles = [
  'package.json',
  'next.config.mjs',
  'server.js',
  'prisma/schema.prisma'
]

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file))
  console.log(`${file}: ${exists ? '✅' : '❌'}`)
})