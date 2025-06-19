import { Pool } from 'pg'

// Create a direct PostgreSQL connection that bypasses Prisma
// This is specifically for authentication to avoid pooler issues

let pool: Pool | null = null

export function getDirectPool() {
  if (!pool) {
    let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
    
    if (!connectionString) {
      throw new Error('No database connection string found')
    }
    
    console.log('[DB] Using connection string from:', process.env.DIRECT_URL ? 'DIRECT_URL' : 'DATABASE_URL')
    console.log('[DB] Connection host:', connectionString.match(/@([^:\/]+)/)?.[1])
    
    // For Supabase, ensure SSL mode is set
    if (!connectionString.includes('sslmode=') && connectionString.includes('supabase')) {
      connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require'
    }
    
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Configure SSL - for Vercel/Supabase we need to handle self-signed certs
    let poolConfig: any = {
      connectionString,
      // Disable prepared statements for pgBouncer compatibility
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    }
    
    if (isProduction && connectionString.includes('supabase')) {
      // For Supabase in production, we need specific SSL settings
      poolConfig.ssl = {
        rejectUnauthorized: false,
        // Explicitly set to handle self-signed certificates
        checkServerIdentity: () => undefined,
      }
    }
    
    pool = new Pool(poolConfig)
  }
  
  return pool
}

export async function queryDirect(text: string, params?: any[]) {
  const pool = getDirectPool()
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Direct query error:', error)
    throw error
  }
}