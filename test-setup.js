const { PrismaClient } = require('@prisma/client')

console.log('🧪 Testing Akashic Campaign Console Setup...\n')

// Check Node version
console.log('✓ Node.js version:', process.version)

// Check environment variables
const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'OPENAI_API_KEY']
const missingEnvVars = []

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✓ ${envVar} is set`)
  } else {
    console.log(`✗ ${envVar} is missing`)
    missingEnvVars.push(envVar)
  }
})

// Test database connection
async function testDatabase() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    console.log('\n✓ Database connection successful')
    
    // Check if tables exist
    const userCount = await prisma.user.count()
    console.log(`✓ Database tables exist (${userCount} users found)`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.log('\n✗ Database connection failed:', error.message)
    console.log('\nPlease ensure:')
    console.log('1. PostgreSQL is running')
    console.log('2. DATABASE_URL is correctly set in .env.local')
    console.log('3. Run: npx prisma db push')
  }
}

// Print summary
console.log('\n📋 Setup Summary:')
if (missingEnvVars.length === 0) {
  console.log('✓ All required environment variables are set')
} else {
  console.log(`✗ Missing environment variables: ${missingEnvVars.join(', ')}`)
  console.log('\nCreate a .env.local file with:')
  missingEnvVars.forEach(envVar => {
    if (envVar === 'DATABASE_URL') {
      console.log(`${envVar}="postgresql://USER:PASSWORD@localhost:5432/akashic_campaign?schema=public"`)
    } else if (envVar === 'NEXTAUTH_SECRET') {
      console.log(`${envVar}="generate-with-openssl-rand-base64-32"`)
    } else if (envVar === 'OPENAI_API_KEY') {
      console.log(`${envVar}="your-openai-api-key"`)
    }
  })
}

// Test database if DATABASE_URL exists
if (process.env.DATABASE_URL) {
  testDatabase()
} else {
  console.log('\n⚠️  Skipping database test (DATABASE_URL not set)')
}

console.log('\n🚀 To start the application:')
console.log('1. Ensure all environment variables are set in .env.local')
console.log('2. Run: npx prisma db push')
console.log('3. Run: npm run dev')
console.log('4. Open http://localhost:3000')