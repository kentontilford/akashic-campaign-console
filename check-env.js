require('dotenv').config({ path: '.env' })

console.log('🔍 Environment Configuration Check\n')

const checks = {
  DATABASE_URL: {
    value: process.env.DATABASE_URL,
    valid: () => process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('USER:PASSWORD'),
    message: 'Database connection string'
  },
  NEXTAUTH_SECRET: {
    value: process.env.NEXTAUTH_SECRET,
    valid: () => process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET !== 'your-secret-key-here-generate-with-openssl-rand-base64-32',
    message: 'Authentication secret (generate with: openssl rand -base64 32)'
  },
  OPENAI_API_KEY: {
    value: process.env.OPENAI_API_KEY,
    valid: () => process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-'),
    message: 'OpenAI API key for AI features (get from https://platform.openai.com/api-keys)'
  }
}

let allValid = true

Object.entries(checks).forEach(([key, check]) => {
  const isValid = check.valid()
  allValid = allValid && isValid
  
  console.log(`${isValid ? '✅' : '❌'} ${key}`)
  if (!isValid) {
    console.log(`   ${check.message}`)
    if (check.value) {
      console.log(`   Current value: "${check.value.substring(0, 20)}..."`)
    } else {
      console.log(`   Not set`)
    }
  }
  console.log('')
})

if (!allValid) {
  console.log('⚠️  Please update your .env file with valid values\n')
  console.log('For AI features to work, you need:')
  console.log('1. A valid OpenAI API key from https://platform.openai.com/api-keys')
  console.log('2. Update OPENAI_API_KEY in your .env file')
  console.log('3. Make sure it starts with "sk-"')
} else {
  console.log('✨ All environment variables are properly configured!')
}