// This file validates critical environment variables at startup
// Import this at the top of your app to ensure configuration is valid

import { env } from './env'

// Validate environment on startup
export function validateStartup() {
  console.log('🚀 Starting Akashic Campaign Console...')
  console.log(`📍 Environment: ${env.NODE_ENV}`)
  console.log(`🔗 URL: ${env.NEXTAUTH_URL}`)
  
  // Check database connection
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured')
  }
  
  // Check Redis configuration
  if (!env.REDIS_HOST || !env.REDIS_PORT) {
    console.warn('⚠️  Redis not configured - caching will be disabled')
  }
  
  // Check AI configuration
  if (!env.OPENAI_API_KEY) {
    console.warn('⚠️  OpenAI API key not configured - AI features will be disabled')
  }
  
  // Security checks
  if (env.NODE_ENV === 'production') {
    if (!env.NEXTAUTH_SECRET || env.NEXTAUTH_SECRET.length < 32) {
      throw new Error('NEXTAUTH_SECRET must be at least 32 characters in production')
    }
    
    if (!env.NEXTAUTH_URL.startsWith('https://')) {
      console.warn('⚠️  NEXTAUTH_URL should use HTTPS in production')
    }
  }
  
  console.log('✅ Environment validation passed\n')
}

// Run validation immediately when imported
if (process.env.NODE_ENV !== 'test') {
  validateStartup()
}