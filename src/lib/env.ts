import { z } from 'zod'

// Define the schema for our environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  
  // Redis (optional)
  REDIS_URL: z.string().url().optional(),
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
  
  // Build-time flags
  SKIP_ENV_VALIDATION: z.string().optional(),
  SKIP_REDIS: z.string().optional(),
})

// Type for our validated environment
export type Env = z.infer<typeof envSchema>

// Determine if we should skip validation
function shouldSkipValidation(): boolean {
  return (
    process.env.SKIP_ENV_VALIDATION === '1' ||
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.BUILDING_IMAGE === '1' ||
    // Railway build environment
    process.env.RAILWAY_ENVIRONMENT_NAME === 'production' && !process.env.DATABASE_URL
  )
}

// Validate environment variables
function validateEnv(): Env {
  // Skip validation during build time or when explicitly disabled
  if (shouldSkipValidation()) {
    console.log('[Env] Validation skipped')
    return process.env as any
  }
  
  try {
    const parsed = envSchema.parse(process.env)
    console.log('[Env] Validation successful')
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingRequired: string[] = []
      const invalidFormat: string[] = []
      
      error.errors.forEach(e => {
        const field = e.path.join('.')
        if (e.code === 'invalid_type' && e.received === 'undefined') {
          // Check if it's actually required
          const fieldSchema = envSchema.shape[e.path[0] as keyof typeof envSchema.shape]
          if (!fieldSchema.isOptional()) {
            missingRequired.push(field)
          }
        } else {
          invalidFormat.push(`${field}: ${e.message}`)
        }
      })
      
      if (missingRequired.length > 0) {
        console.error('❌ Missing required environment variables:', missingRequired.join(', '))
      }
      if (invalidFormat.length > 0) {
        console.error('❌ Invalid environment variables:')
        invalidFormat.forEach(msg => console.error(`  ${msg}`))
      }
      
      console.error('\nPlease check your .env file and ensure all required variables are set correctly.')
      
      // In production, exit to prevent running with invalid config
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
    throw error
  }
}

// Create a lazy-loading proxy for environment variables
class LazyEnv {
  private _cachedEnv: Env | null = null
  private _isValidating = false

  get env(): Env {
    // During build or when validation is skipped, return raw env
    if (shouldSkipValidation()) {
      return process.env as any
    }

    // Lazy validation on first real access
    if (!this._cachedEnv && !this._isValidating) {
      this._isValidating = true
      try {
        this._cachedEnv = validateEnv()
      } finally {
        this._isValidating = false
      }
    }

    return this._cachedEnv || (process.env as any)
  }
}

const lazyEnv = new LazyEnv()

// Export validated environment variables as a proxy
export const env = new Proxy({} as Env, {
  get(target, prop) {
    return lazyEnv.env[prop as keyof Env]
  }
})

// Helper function to generate NEXTAUTH_SECRET
export function generateNextAuthSecret(): string {
  try {
    return require('crypto').randomBytes(32).toString('base64')
  } catch {
    // Fallback for build environments where crypto might not be available
    return 'generated-secret-please-change-in-production'
  }
}

// Export a function to manually trigger validation (useful for health checks)
export function validateEnvironment(): boolean {
  try {
    if (!shouldSkipValidation()) {
      validateEnv()
    }
    return true
  } catch {
    return false
  }
}