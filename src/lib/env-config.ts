// Environment variable validation with safe defaults for build time
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION === '1',
};

// Only validate in runtime, not build time
export function validateEnv() {
  if (env.SKIP_ENV_VALIDATION) return;
  
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0 && env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}