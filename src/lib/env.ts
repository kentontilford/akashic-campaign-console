import { z } from 'zod'

// Define the schema for our environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // Redis (optional)
  REDIS_HOST: z.string().min(1).optional(),
  REDIS_PORT: z.string().regex(/^\d+$/).optional(),
  REDIS_PASSWORD: z.string().optional(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  
  // Email (optional for now)
  EMAIL_FROM: z.string().email().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  
  // Social Media (optional for now)
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

// Type for our validated environment
export type Env = z.infer<typeof envSchema>

// Validate environment variables
function validateEnv(): Env {
  // Skip validation during build time
  if (process.env.SKIP_ENV_VALIDATION === '1') {
    return process.env as any
  }
  
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ')
      console.error('❌ Invalid environment variables:', missingVars)
      console.error('\nEnvironment validation errors:')
      error.errors.forEach(e => {
        console.error(`  ${e.path.join('.')}: ${e.message}`)
      })
      console.error('\nPlease check your .env file and ensure all required variables are set correctly.')
      process.exit(1)
    }
    throw error
  }
}

// Export validated environment variables
// Use a Proxy to lazy-load and validate only when accessed
export const env = new Proxy({} as Env, {
  get(target, prop) {
    // Skip validation during build
    if (process.env.SKIP_ENV_VALIDATION === '1') {
      return process.env[prop as string]
    }
    
    // Validate on first access
    if (!target._validated) {
      Object.assign(target, validateEnv())
      target._validated = true
    }
    
    return target[prop as keyof Env]
  }
}) as Env

// Helper function to generate NEXTAUTH_SECRET
export function generateNextAuthSecret(): string {
  return require('crypto').randomBytes(32).toString('base64')
}